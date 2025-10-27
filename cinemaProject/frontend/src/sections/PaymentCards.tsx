// src/sections/PaymentCards.tsx
import { useEffect, useState } from "react";
import {
  listCards,
  addCard,
  updateCard,
  deleteCard,
  type PaymentCard,
} from "../data/auth";

export default function PaymentCards() {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setErr(null);
    try {
      const c = await listCards();
      setCards(c);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load cards");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 transition hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Payment Cards</h2>
        <button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-4 py-2 shadow hover:opacity-90 transition disabled:opacity-50"
          onClick={() => setAdding(true)}
          disabled={cards.length >= 4}
          title={cards.length >= 4 ? "Maximum 4 cards allowed" : "Add card"}
        >
          Add Card
        </button>
      </div>

      {msg && (
        <div className="mb-3 rounded bg-green-50 border border-green-300 text-green-700 p-3 text-sm">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-3 rounded bg-red-50 border border-red-300 text-red-700 p-3 text-sm">
          {err}
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {cards.map((c) => (
          <li
            key={c.id}
            className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="text-sm text-gray-600">
              <div className="font-medium text-gray-900">
                {c.card_holder_name}
              </div>
              <div className="text-gray-500">
                {c.card_number_masked} •{" "}
                {String(c.expiry_month).padStart(2, "0")}/{c.expiry_year}
              </div>
              <div className="text-gray-400 text-xs">
                {c.billing_street}, {c.billing_city}, {c.billing_state}{" "}
                {c.billing_zip}
              </div>
              {c.is_default && (
                <span className="inline-block text-xs text-green-700 bg-green-100 border border-green-300 rounded px-2 py-0.5 mt-1">
                  Default
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {!c.is_default && (
                <button
                  className="text-sm text-blue-600 hover:text-blue-700 underline transition"
                  onClick={async () => {
                    try {
                      await updateCard(c.id, { is_default: true });
                      setMsg("Card set as default");
                      await load();
                    } catch (e) {
                      setErr(
                        e instanceof Error
                          ? e.message
                          : "Failed to update card"
                      );
                    }
                  }}
                >
                  Make Default
                </button>
              )}
              <button
                className="text-sm text-red-600 hover:text-red-700 underline transition"
                onClick={async () => {
                  try {
                    await deleteCard(c.id);
                    setMsg("Card deleted");
                    await load();
                  } catch (e) {
                    setErr(
                      e instanceof Error ? e.message : "Failed to delete card"
                    );
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {cards.length === 0 && (
          <li className="py-4 text-sm text-gray-500 text-center">
            No cards yet.
          </li>
        )}
      </ul>

      {adding && (
        <AddCardForm
          onClose={async (changed) => {
            setAdding(false);
            if (changed) await load();
          }}
        />
      )}
    </div>
  );
}

function AddCardForm({ onClose }: { onClose: (changed: boolean) => void }) {
  const [form, setForm] = useState({
    card_number: "",
    card_holder_name: "",
    expiry_month: 1,
    expiry_year: new Date().getFullYear(),
    cvv: "",
    billing_street: "",
    billing_city: "",
    billing_state: "",
    billing_zip: "",
    is_default: false,
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === "checkbox"
          ? checked
          : name.includes("expiry_")
          ? Number(value)
          : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await addCard(form);
      onClose(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 border-t border-gray-200 pt-6 grid grid-cols-1 gap-4"
    >
      {err && (
        <div className="rounded bg-red-50 border border-red-300 text-red-700 p-3 text-sm">
          {err}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          name="card_number"
          value={form.card_number}
          onChange={onChange}
          className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Card Holder Name
        </label>
        <input
          name="card_holder_name"
          value={form.card_holder_name}
          onChange={onChange}
          className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expiry Month
          </label>
          <input
            type="number"
            min={1}
            max={12}
            name="expiry_month"
            value={form.expiry_month}
            onChange={onChange}
            className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expiry Year
          </label>
          <input
            type="number"
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 20}
            name="expiry_year"
            value={form.expiry_year}
            onChange={onChange}
            className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CVV</label>
          <input
            name="cvv"
            value={form.cvv}
            onChange={onChange}
            className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Billing Street
        </label>
        <input
          name="billing_street"
          value={form.billing_street}
          onChange={onChange}
          className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            name="billing_city"
            value={form.billing_city}
            onChange={onChange}
            className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            name="billing_state"
            value={form.billing_state}
            onChange={onChange}
            className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ZIP</label>
          <input
            name="billing_zip"
            value={form.billing_zip}
            onChange={onChange}
            className="mt-1 w-full bg-white border border-gray-300 rounded-lg text-gray-800 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="is_default"
          checked={form.is_default}
          onChange={onChange}
          className="accent-blue-600"
        />
        Set as default
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 transition"
          onClick={() => onClose(false)}
        >
          Cancel
        </button>
        <button
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-4 py-2 shadow hover:opacity-90 transition"
        >
          {loading ? "Saving..." : "Add Card"}
        </button>
      </div>
    </form>
  );
}