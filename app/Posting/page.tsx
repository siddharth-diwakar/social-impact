import Link from "next/link";

const tagOptions = {
  industry: [
    "Floral & Agriculture",
    "Food & Beverage",
    "Health & Wellness",
    "Beauty & Personal Care",
    "Arts & Crafts",
    "Home & Garden",
    "Apparel & Accessories",
    "Electronics & Gadgets",
    "Professional Services",
    "Events & Entertainment",
    "Education & Tutoring",
    "Sports & Recreation",
    "Non-profit & Community",
    "Other",
  ],
  businessModel: [
    "Retailer — Brick & Mortar",
    "Retailer — Online (D2C)",
    "Retailer — Hybrid",
    "Wholesale (B2B)",
    "Manufacturer / Producer",
    "Service Provider",
    "Subscription",
    "Marketplace Seller",
    "Marketplace Operator",
    "Franchisee",
    "Franchisor",
    "Non-profit",
  ],
  customerDemographic: [
    "Local Residents",
    "Event Planners",
    "Weddings & Couples",
    "Corporate Offices",
    "Restaurants & Cafes",
    "Hotels & Venues",
    "Schools & Universities",
    "Non-profits & Community Orgs",
    "Other Small Businesses (B2B)",
    "Online Shoppers (Nationwide)",
    "Parents & Families",
    "Students & Young Adults",
    "Seniors",
    "Tourists",
    "High-income Households",
    "Budget-conscious Shoppers",
  ],
  weeklyCustomers: [
    "0–10",
    "11–25",
    "26–50",
    "51–100",
    "101–250",
    "251–500",
    "501–1,000",
    "1,001–1,500",
    "1,501–2,500",
    "2,500+",
  ],
};

export const metadata = {
  title: "Create a Post",
  description: "Tag your post and share updates with the community.",
};

export default function PostingPage() {
  return (
    <div className="min-h-screen bg-white text-[#144C3A] transition-colors dark:bg-slate-950 dark:text-slate-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="space-y-4">
          <Link
            href="/Community"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1F7A5C] transition hover:text-[#176A4E] dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            ← Back to community
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#1F7A5C] dark:text-emerald-300">
              Create a new post
            </h1>
            <p className="text-sm text-[#52615D] dark:text-slate-400">
              Choose the tags that best describe your business so members can
              find the conversation, then share your question or update.
            </p>
          </div>
        </header>

        <form className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1F7A5C] dark:text-emerald-300">
              Tag your post
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="industry"
                  className="text-sm font-semibold text-[#144C3A] dark:text-slate-100"
                >
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  className="w-full rounded-lg border border-[#D3DAD7] bg-white px-4 py-3 text-sm text-[#144C3A] shadow-sm transition-colors focus:border-[#1F7A5C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
                  defaultValue=""
                  required
                >
                  <option disabled value="">
                    Select an industry
                  </option>
                  {tagOptions.industry.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="businessModel"
                  className="text-sm font-semibold text-[#144C3A] dark:text-slate-100"
                >
                  Business model
                </label>
                <select
                  id="businessModel"
                  name="businessModel"
                  className="w-full rounded-lg border border-[#D3DAD7] bg-white px-4 py-3 text-sm text-[#144C3A] shadow-sm transition-colors focus:border-[#1F7A5C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
                  defaultValue=""
                  required
                >
                  <option disabled value="">
                    Select a business model
                  </option>
                  {tagOptions.businessModel.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="customerDemographic"
                  className="text-sm font-semibold text-[#144C3A] dark:text-slate-100"
                >
                  Customer demographic
                </label>
                <select
                  id="customerDemographic"
                  name="customerDemographic"
                  className="w-full rounded-lg border border-[#D3DAD7] bg-white px-4 py-3 text-sm text-[#144C3A] shadow-sm transition-colors focus:border-[#1F7A5C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
                  defaultValue=""
                  required
                >
                  <option disabled value="">
                    Select a customer demographic
                  </option>
                  {tagOptions.customerDemographic.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="weeklyCustomers"
                  className="text-sm font-semibold text-[#144C3A] dark:text-slate-100"
                >
                  Weekly number of customers
                </label>
                <select
                  id="weeklyCustomers"
                  name="weeklyCustomers"
                  className="w-full rounded-lg border border-[#D3DAD7] bg-white px-4 py-3 text-sm text-[#144C3A] shadow-sm transition-colors focus:border-[#1F7A5C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
                  defaultValue=""
                  required
                >
                  <option disabled value="">
                    Select a range
                  </option>
                  {tagOptions.weeklyCustomers.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1F7A5C] dark:text-emerald-300">
              Post content
            </h2>
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-semibold text-[#144C3A] dark:text-slate-100"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Give your post a clear headline"
                className="w-full rounded-lg border border-[#D3DAD7] bg-white px-4 py-3 text-sm text-[#144C3A] shadow-sm transition-colors focus:border-[#1F7A5C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-semibold text-[#144C3A] dark:text-slate-100"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={8}
                placeholder="Share your question, story, or learning in detail..."
                className="w-full rounded-lg border border-[#D3DAD7] bg-white px-4 py-3 text-sm text-[#144C3A] shadow-sm transition-colors focus:border-[#1F7A5C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20"
                required
              />
              <p className="text-xs text-[#5F6F6B] dark:text-slate-400">
                Markdown supported. Keep personal details private.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1F7A5C] dark:text-emerald-300">
              Attach images
            </h2>
            <label
              htmlFor="images"
              className="flex w-full flex-col gap-3 rounded-xl border border-dashed border-[#D3DAD7] bg-[#F8FAF9] p-6 text-center text-sm text-[#5F6F6B] transition hover:border-[#1F7A5C] hover:text-[#1F7A5C] dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
            >
              <span>Drag and drop files, or click to browse</span>
              <span className="text-xs dark:text-slate-500">
                Accepted formats: JPG, PNG · Max 1 MB each
              </span>
              <input
                id="images"
                name="images"
                type="file"
                accept="image/png,image/jpeg"
                multiple
                className="sr-only"
              />
            </label>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/Community"
              className="inline-flex items-center justify-center rounded-full border border-[#D3DAD7] px-5 py-2.5 text-sm font-medium text-[#1F7A5C] transition hover:bg-[#F4F7F6] hover:text-[#176A4E] dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900/40 dark:hover:text-emerald-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[#1F7A5C] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#176A4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F7A5C] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:focus-visible:outline-emerald-400"
            >
              Publish post
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
