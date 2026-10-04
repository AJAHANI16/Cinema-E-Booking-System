// src/pages/ProfilePage.tsx
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getUserProfile, updateProfile, changePassword} from "../data/auth";
import PaymentCards from "../sections/PaymentCards";

interface UserProfileData {
    first_name: string;
    last_name: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    subscribed_to_promotions: boolean;
    email: string;
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    const navigate = useNavigate();

    const [form, setForm] = useState<UserProfileData>({
        first_name: "",
        last_name: "",
        street_address: "",
        city: "",
        state: "",
        zip_code: "",
        subscribed_to_promotions: false,
        email: "",
    });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getUserProfile();
                if (!mounted) return;

                const u = data.user as unknown as Record<string, unknown>;
                const profile = (u.profile ?? {}) as Record<string, unknown>;

                setForm({
                    first_name: String(u.first_name ?? ""),
                    last_name: String(u.last_name ?? ""),
                    street_address: String(profile.street_address ?? ""),
                    city: String(profile.city ?? ""),
                    state: String(profile.state ?? ""),
                    zip_code: String(profile.zip_code ?? ""),
                    subscribed_to_promotions: Boolean(
                        typeof profile.subscribed_to_promotions === "boolean"
                            ? profile.subscribed_to_promotions
                            : false
                    ),
                    email: String(u.email ?? ""),
                });
            } catch (e) {
                if (!mounted) return;

                const message = e instanceof Error ? e.message : String(e);
                const status =
                    typeof e === "object" && e !== null && "status" in e
                        ? (e as any).status
                        : undefined;
                const responseStatus =
                    typeof e === "object" && e !== null && "response" in e
                        ? (e as any).response?.status
                        : undefined;

                const unauthorized =
                    status === 401 ||
                    responseStatus === 401 ||
                    /\b401\b|unauthori[sz]ed|not authenticated|login required|invalid token/i.test(
                        message
                    );

                if (unauthorized) {
                    navigate("/login", {replace: true});
                    return;
                }

                setErr(message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, type, checked, value} = e.target;
        setForm((prev) => ({...prev, [name]: type === "checkbox" ? checked : value}));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setMsg(null);
        try {
            const {email, ...payload} = form;
            void email;
            const res = await updateProfile(payload);
            setMsg(res.message || "Profile updated successfully.");
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Failed to update profile");
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-gray-400 text-lg">Loading...</div>
        );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 py-10 px-6">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <header className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow">
                        My Profile
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Manage your personal info, security, and payment details.
                    </p>
                </header>

                {/* Profile Form */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 transition hover:shadow-xl">
                    <h2 className="text-xl font-semibold mb-5 text-gray-800">
                        Personal Information
                    </h2>

                    {msg && (
                        <div className="mb-4 rounded-lg bg-green-50 border border-green-300 text-green-700 p-3 text-sm">
                            {msg}
                        </div>
                    )}
                    {err && (
                        <div
                            className="mb-4 rounded-lg bg-red-50 border border-red-300 text-red-700 p-3 text-sm whitespace-pre-line">
                            {err}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input
                                label="First Name"
                                name="first_name"
                                value={form.first_name}
                                onChange={onChange}
                            />
                            <Input
                                label="Last Name"
                                name="last_name"
                                value={form.last_name}
                                onChange={onChange}
                            />
                        </div>

                        <Input label="Email (read-only)" value={form.email} readOnly/>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input
                                label="Street Address"
                                name="street_address"
                                value={form.street_address}
                                onChange={onChange}
                            />
                            <Input
                                label="City"
                                name="city"
                                value={form.city}
                                onChange={onChange}
                            />
                            <Input
                                label="State"
                                name="state"
                                value={form.state}
                                onChange={onChange}
                            />
                            <Input
                                label="ZIP Code"
                                name="zip_code"
                                value={form.zip_code}
                                onChange={onChange}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="subscribed_to_promotions"
                                checked={form.subscribed_to_promotions}
                                onChange={onChange}
                                className="accent-blue-600"
                            />
                            Receive promotional offers
                        </label>

                        <button
                            type="submit"
                            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white font-medium hover:opacity-90 transition-all shadow"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <PasswordChangeCard/>

                {/* Payment Section */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 transition hover:shadow-xl">
                    <PaymentCards/>
                </div>
            </div>
        </div>
    );
}

/* Reusable Input Component */
function Input({
                   label,
                   name,
                   value,
                   onChange,
                   readOnly = false,
                   type = "text",
               }: {
    label: string;
    name?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readOnly?: boolean;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type={type}
                className={`w-full rounded-lg bg-gray-50 border border-gray-300 text-gray-800 p-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                    readOnly ? "opacity-70 cursor-not-allowed" : ""
                }`}
                name={name}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
            />
        </div>
    );
}

/* Password Change Card */
function PasswordChangeCard() {
    const [curr, setCurr] = useState("");
    const [pw1, setPw1] = useState("");
    const [pw2, setPw2] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setMsg(null);
        setLoading(true);
        try {
            const res = await changePassword(curr, pw1, pw2);
            setMsg(res.message || "Password changed successfully.");
            setCurr("");
            setPw1("");
            setPw2("");
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 transition hover:shadow-xl">
            <h2 className="text-xl font-semibold mb-5 text-gray-800">
                Change Password
            </h2>

            {msg && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-300 text-green-700 p-3 text-sm">
                    {msg}
                </div>
            )}
            {err && (
                <div
                    className="mb-4 rounded-lg bg-red-50 border border-red-300 text-red-700 p-3 text-sm whitespace-pre-line">
                    {err}
                </div>
            )}

            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 max-w-md">
                <Input
                    label="Current Password"
                    value={curr}
                    onChange={(e) => setCurr(e.target.value)}
                    type="password"
                />
                <Input
                    label="New Password"
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    type="password"
                />
                <Input
                    label="Confirm New Password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    type="password"
                />

                <button
                    disabled={loading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white font-medium hover:opacity-90 transition-all shadow"
                >
                    {loading ? "Saving..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}