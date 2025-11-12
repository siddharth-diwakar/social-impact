import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// 🔹 Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const LLM_TOKEN = process.env.LLM_TOKEN;
const LLM_ENDPOINT = process.env.LLM_ENDPOINT;
const LLM_MODEL = process.env.LLM_MODEL;

// 🔹 Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const client = new OpenAI({ baseURL: LLM_ENDPOINT, apiKey: LLM_TOKEN });

// 🔹 Constants
const TAG_OPTIONS = ["CREATIVE", "FOOD_AND_BEV", "TOURISM", "SERVICES", "OTHER"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 🔹 Send a text prompt to LLM for classification
 */
async function getTagForRow(text) {
    if (!text || text.trim().length < 20) {
        console.log("⚠️ Skipping LLM call - insufficient text");
        return "OTHER";
    }

    const userPrompt = `
You are classifying Austin City Council agenda items.
Choose the single best tag from this list:
${TAG_OPTIONS.join(", ")}.

Definitions:
- FOOD_AND_BEV: Related to restaurants, cafes, food trucks, bars, or food/beverage policy.
- CREATIVE: Related to art, music, culture, performances, design, or entertainment venues.
- TOURISM: Related to events, hospitality, travel, hotels, attractions, or destination marketing.
- SERVICES: Related to local services, maintenance, community programs, or business operations.
- OTHER: If none of the above apply clearly.

Return a JSON string containing exactly one tag from the list (e.g., "SERVICES") and nothing else.

Item details:
${text}
`;

    try {
        const response = await client.chat.completions.create({
            model: LLM_MODEL,
            messages: [
                { role: "system", content: "You are a helpful assistant that classifies policy text into relevant business categories." },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
        });

        const content = response.choices[0].message.content.trim();
        console.log(`🤖 LLM Response: ${content}`);

        try {
            const parsed = JSON.parse(content);
            if (typeof parsed === "string" && TAG_OPTIONS.includes(parsed)) {
                return parsed;
            }
            if (Array.isArray(parsed)) {
                const valid = parsed.find((tag) => TAG_OPTIONS.includes(tag));
                if (valid) return valid;
            }
            return "OTHER";
        } catch {
            // Fallback: search for tags in response
            const foundTags = TAG_OPTIONS.filter((tag) => content.toUpperCase().includes(tag));
            return foundTags[0] || "OTHER";
        }
    } catch (err) {
        console.error("❌ Error from LLM:", err.message);
        if (err.response?.data) {
            console.error("Response data:", err.response.data);
        }
        return "OTHER";
    }
}

/**
 * 🔹 Update PERSONAL_TAG for a specific row using service_role key
 */
async function updateClassificationTag(id, tag) {
    // Create admin client with service_role key (bypasses RLS and replica identity)
    const adminClient = createClient(
        SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY
    );

    const { data, error } = await adminClient
        .from("council_items")
        .update({ classification_tag: tag })
        .eq("id", id);

    if (error) {
        console.log(`❌ Update failed for row ${id}:`, error.message);
        return false;
    }

    console.log(`✅ Updated ${id} → ${tag}`);
    return true;
}

/**
 * 🔹 Process all rows from Supabase
 */
async function processDatabase() {
    console.log("🚀 Starting database processor...\n");

    // Fetch rows waiting on classification
    const { data: rows, error } = await supabase
        .from("council_items")
        .select(
            "id, item_number, summary, current_status, source_tags, item_type, request_type, lead_dept, sub_depts, agenda_date, status"
        )
        .is("classification_tag", null)
        .order("agenda_date", { ascending: true })
        .limit(500);

    if (error) {
        console.error("❌ Error fetching from Supabase:", error.message);
        return;
    }

    console.log(`📄 Found ${rows.length} rows to process\n`);
    console.log("=".repeat(80) + "\n");

    let successCount = 0;
    let failCount = 0;

    for (const [index, row] of rows.entries()) {
        // Build text for classification from the key table columns
        const text = `
STATUS: ${row.status || ""}
AGENDA_DATE: ${row.agenda_date || ""}
SUMMARY: ${row.summary || ""}
CURRENT_STATUS: ${row.current_status || ""}
SOURCE_TAGS: ${row.source_tags || ""}
ITEM_TYPE: ${row.item_type || ""}
REQUEST_TYPE: ${row.request_type || ""}
LEAD_DEPT: ${row.lead_dept || ""}
SUB_DEPTS: ${row.sub_depts || ""}
`.trim();

        console.log(`\n📝 Processing ${index + 1}/${rows.length}: ${row.item_number}`);
        console.log(`📄 Text length: ${text.length} characters`);

        if (text.length > 100) {
            console.log(`📄 Preview: ${text.substring(0, 250)}...`);
        }

        // Get classification tag
        const tag = await getTagForRow(text);

        // Update in Supabase
        const success = await updateClassificationTag(row.id, tag);

        if (success) {
            successCount++;
        } else {
            failCount++;
        }

        // Rate limiting - adjust as needed
        await sleep(1500);

        // Optional: Remove this to process all rows
        // Remove this block to process all rows
        if (index >= 9) {
            console.log("\n⏸️ Stopping after 10 items for testing. Remove this guard to process all rows.");
            break;
        }
    }

    console.log("\n" + "=".repeat(80));
    console.log(`\n🎉 Processing complete!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
}

// 🔹 Create the Postgres function if it doesn't exist
async function setupDatabase() {
    console.log("🔧 Checking database setup...\n");

    // Test if we can update
    const testClient = createClient(
        SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY
    );

    const { data, error } = await testClient
        .from("council_items")
        .select("id")
        .limit(1);

    if (error) {
        console.log("❌ Cannot connect to database:", error.message);
        process.exit(1);
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log("✅ Using service_role key - should bypass replica identity issues\n");
    } else {
        console.log("⚠️ Using publishable key - may have permission issues");
        console.log("💡 Add SUPABASE_SERVICE_ROLE_KEY to .env for better reliability\n");
    }
}

// 🔹 Run
(async () => {
    await setupDatabase();
    await processDatabase();
})();
