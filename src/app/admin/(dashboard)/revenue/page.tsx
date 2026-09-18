"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
	DATE_FILTER_OPTIONS,
	addDays,
	getLocalISODate,
	matchesDateFilter,
	type DateFilterMode,
} from "../dateFilterUtils";

type ChartType = "bar" | "line" | "area";
type RevenueDateFilter = DateFilterMode | "last30";

type RevenueAppointment = {
	id: string;
	patient_name: string;
	preferred_date: string;
	treatment: string;
	status: string;
	created_at: string;
};

type RevenueTreatment = {
	name: string;
	price: number | null;
};

type MonthlyRevenue = {
	label: string;
	value: number;
};

type TreatmentRevenue = {
	name: string;
	value: number;
	count: number;
};

const MONTH_COUNT = 6;
const CHART_COLORS = ["#176b69", "#2f8f83", "#b88935", "#63a9a0", "#7c9bb8", "#d6b66b"];

function formatCurrency(value: number) {
	return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function getMonthKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date) {
	return date.toLocaleDateString("en-IN", { month: "short" });
}

function formatRevenueDate(isoDate: string) {
	const date = new Date(`${isoDate}T00:00:00`);
	return Number.isNaN(date.getTime()) ? isoDate : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function MetricIcon({ icon }: { icon: "revenue" | "appointments" | "average" | "pending" }) {
	const props = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "h-5 w-5", "aria-hidden": true };
	if (icon === "revenue") return <svg {...props}><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 4-6" /></svg>;
	if (icon === "appointments") return <svg {...props}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M7 3.5v3M17 3.5v3M3.5 9h17" /><path d="m8 14 2.2 2.2 5-5" /></svg>;
	if (icon === "average") return <svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M15 9.5c-.6-.7-1.5-1-2.7-1-1.4 0-2.4.7-2.4 1.7 0 2.4 5.1 1.1 5.1 3.8 0 1.1-1 1.9-2.6 1.9-1.3 0-2.3-.4-3-1.2M12 7v10" /></svg>;
	return <svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>;
}

function SummaryCard({ label, value, detail, icon, theme }: { label: string; value: string; detail: string; icon: "revenue" | "appointments" | "average" | "pending"; theme: string }) {
	return (
		<div className={`group rounded-2xl border p-4 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:shadow-md ${theme}`}>
			<div className="flex items-start justify-between gap-3">
				<div><p className="admin-revenue-label text-[10px] font-bold uppercase tracking-[0.08em] opacity-75">{label}</p><p className="admin-revenue-value mt-2 text-[26px] font-bold leading-none tracking-tight text-[var(--admin-heading)]">{value}</p></div>
					<span className="admin-revenue-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm transition-transform duration-200 group-hover:scale-105"><MetricIcon icon={icon} /></span>
			</div>
				<p className="admin-revenue-detail mt-3 text-[11px] font-medium opacity-75">{detail}</p>
		</div>
	);
}

function getAppointmentAmount(appointment: RevenueAppointment, revenueByTreatment: Map<string, number>) {
	return revenueByTreatment.get(appointment.treatment.trim().toLowerCase()) ?? 0;
}

function RevenueByTreatment({ data, total }: { data: TreatmentRevenue[]; total: number }) {
	if (!data.length || total <= 0) {
		return <div className="flex min-h-64 items-center justify-center text-sm text-[var(--admin-text-soft)]">No revenue data</div>;
	}

	let offset = 0;
	const segments = data.map((item, index) => {
		const percentage = (item.value / total) * 100;
		const segment = { ...item, percentage, offset, color: CHART_COLORS[index % CHART_COLORS.length] };
		offset += percentage;
		return segment;
	});

	return (
		<div className="flex min-h-64 items-center gap-5 py-3 sm:gap-8">
			<div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
				<div className="h-full w-full rounded-full" style={{ background: `conic-gradient(${segments.map((segment) => `${segment.color} ${segment.offset}% ${segment.offset + segment.percentage}%`).join(", ")})` }} />
				<div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-[var(--admin-surface-strong)] text-center">
					<span className="text-[10px] text-[var(--admin-text-soft)]">Total revenue</span>
					<strong className="mt-1 text-sm text-[var(--admin-heading)]">{formatCurrency(total)}</strong>
				</div>
			</div>
			<div className="min-w-0 flex-1 space-y-2.5">
				{segments.map((segment) => (
					<div key={segment.name} className="flex items-center gap-2 text-xs">
						<span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} aria-hidden="true" />
						<span className="min-w-0 flex-1 truncate text-[var(--admin-text)]">{segment.name}</span>
						<span className="text-[var(--admin-text-soft)]">{Math.round(segment.percentage)}%</span>
					</div>
				))}
			</div>
		</div>
	);
}

function escapeCsvValue(value: string | number) {
	return `"${String(value).replaceAll('"', '""')}"`;
}

function RevenueChart({ data, chartType }: { data: MonthlyRevenue[]; chartType: ChartType }) {
	const maxValue = Math.max(...data.map((item) => item.value), 1);
	const points = data.map((item, index) => {
		const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
		const y = 100 - (item.value / maxValue) * 82;
		return { ...item, x, y };
	});
	const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
	const areaPoints = `0,100 ${linePoints} 100,100`;

	return (
		<div className="mt-5">
			<div className="relative h-64 w-full">
				<div className="absolute inset-0 flex flex-col justify-between text-[10px] text-[var(--admin-text-soft)]">
					{[1, 0.66, 0.33, 0].map((fraction) => (
						<div key={fraction} className="flex items-center gap-2">
							<span className="w-12 text-right">{formatCurrency(maxValue * fraction)}</span>
							<div className="h-px flex-1 bg-[var(--admin-border)]" />
						</div>
					))}
				</div>
				<div className="absolute inset-y-0 left-14 right-0">
					{chartType === "bar" ? (
						<div className="flex h-full items-end justify-around gap-2 px-2 pb-0">
							{points.map((point) => (
								<div key={point.label} className="flex h-full flex-1 items-end justify-center" title={`${point.label}: ${formatCurrency(point.value)}`}>
									<div className="w-full max-w-12 rounded-t-md bg-[var(--admin-link)] transition-all" style={{ height: `${Math.max((point.value / maxValue) * 82, point.value ? 3 : 0)}%` }} />
								</div>
							))}
						</div>
					) : (
						<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Monthly revenue chart">
							{chartType === "area" && <polygon points={areaPoints} fill="color-mix(in srgb, var(--admin-link) 16%, transparent)" />}
							<polyline points={linePoints} fill="none" stroke="var(--admin-link)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
							{points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="1.8" fill="var(--admin-link)" vectorEffect="non-scaling-stroke" />)}
						</svg>
					)}
				</div>
			</div>
			<div className="ml-14 mt-2 flex justify-around text-[10px] text-[var(--admin-text-soft)]">
				{data.map((item) => <span key={item.label}>{item.label}</span>)}
			</div>
		</div>
	);
}

export default function RevenuePage() {
	const [appointments, setAppointments] = useState<RevenueAppointment[]>([]);
	const [treatments, setTreatments] = useState<RevenueTreatment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [chartType, setChartType] = useState<ChartType>("bar");
	const [dateFilter, setDateFilter] = useState<RevenueDateFilter>("last30");
	const [customDate, setCustomDate] = useState("");
	const [treatmentFilter, setTreatmentFilter] = useState("all");

	useEffect(() => {
		let isMounted = true;
		async function loadRevenue() {
			setIsLoading(true);
			setError(null);
			const supabase = createClient();
			const [{ data: appointmentData, error: appointmentsError }, { data: treatmentData, error: treatmentsError }] = await Promise.all([
				supabase.from("appointments").select("id, patient_name, preferred_date, treatment, status, created_at"),
				supabase.from("treatments").select("name, price"),
			]);
			if (!isMounted) return;
			if (appointmentsError || treatmentsError) {
				setError("Revenue data could not be loaded right now.");
			} else {
				setAppointments((appointmentData ?? []) as RevenueAppointment[]);
				setTreatments((treatmentData ?? []) as RevenueTreatment[]);
			}
			setIsLoading(false);
		}
		loadRevenue().catch(() => {
			if (isMounted) {
				setError("Revenue data could not be loaded right now.");
				setIsLoading(false);
			}
		});
		return () => { isMounted = false; };
	}, []);

	const revenueByTreatment = useMemo(() => new Map(treatments.map((treatment) => [treatment.name.trim().toLowerCase(), Number(treatment.price) || 0])), [treatments]);
	const todayIso = getLocalISODate();
	const selectedAppointments = useMemo(() => appointments.filter((appointment) => {
		if (dateFilter === "last30") {
			return appointment.preferred_date >= addDays(todayIso, -29) && appointment.preferred_date <= todayIso;
		}
		return matchesDateFilter(appointment.preferred_date, dateFilter, customDate, todayIso);
	}), [appointments, customDate, dateFilter, todayIso]);
	const paidAppointments = useMemo(() => selectedAppointments.filter((appointment) => appointment.status === "completed" && getAppointmentAmount(appointment, revenueByTreatment) > 0), [revenueByTreatment, selectedAppointments]);
	const totalRevenue = useMemo(() => paidAppointments.reduce((total, appointment) => total + (revenueByTreatment.get(appointment.treatment.trim().toLowerCase()) ?? 0), 0), [paidAppointments, revenueByTreatment]);
	const treatmentRevenue = useMemo(() => {
		const groups = new Map<string, TreatmentRevenue>();
		paidAppointments.forEach((appointment) => {
			const key = appointment.treatment.trim().toLowerCase();
			const current = groups.get(key) ?? { name: appointment.treatment, value: 0, count: 0 };
			current.value += getAppointmentAmount(appointment, revenueByTreatment);
			current.count += 1;
			groups.set(key, current);
		});
		return [...groups.values()].sort((first, second) => second.value - first.value);
	}, [paidAppointments, revenueByTreatment]);
	const monthlyRevenue = useMemo(() => {
		const now = new Date();
		const months = Array.from({ length: MONTH_COUNT }, (_, index) => new Date(now.getFullYear(), now.getMonth() - (MONTH_COUNT - 1 - index), 1));
		const values = new Map(months.map((month) => [getMonthKey(month), 0]));
		paidAppointments.forEach((appointment) => {
			const date = new Date(`${appointment.preferred_date}T00:00:00`);
			const key = getMonthKey(date);
			if (values.has(key)) values.set(key, (values.get(key) ?? 0) + (revenueByTreatment.get(appointment.treatment.trim().toLowerCase()) ?? 0));
		});
		return months.map((month) => ({ label: getMonthLabel(month), value: values.get(getMonthKey(month)) ?? 0 }));
	}, [paidAppointments, revenueByTreatment]);
	const averageRevenue = paidAppointments.length ? totalRevenue / paidAppointments.length : 0;
	const pendingAppointments = selectedAppointments.filter((appointment) => appointment.status === "pending").length;
	const displayedAppointments = useMemo(() => treatmentFilter === "all" ? paidAppointments : paidAppointments.filter((appointment) => appointment.treatment.trim().toLowerCase() === treatmentFilter), [paidAppointments, treatmentFilter]);
	const filterOptions = [{ value: "last30", label: "Last 30 days" }, ...DATE_FILTER_OPTIONS];

	function exportRevenueDetails() {
		const header = ["Date", "Patient", "Treatment", "Amount", "Payment Status", "Doctor"];
		const rows = displayedAppointments.map((appointment) => [appointment.preferred_date, appointment.patient_name, appointment.treatment, formatCurrency(getAppointmentAmount(appointment, revenueByTreatment)), "Paid", "Not assigned"]);
		const csv = [header, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "revenue-details.csv";
		link.click();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2 text-xs text-[var(--admin-text-soft)]">
				<Link href="/admin" aria-label="Back to Dashboard" className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-[var(--admin-surface)] hover:text-[var(--admin-link)]">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
				</Link>
				<Link href="/admin" className="hover:text-[var(--admin-link)]">Dashboard</Link>
				<span>/</span>
				<span>Revenue</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-status-selected-bg)] text-[var(--admin-link)]" aria-hidden="true">₹</span>
				<div>
					<h1 className="text-2xl font-bold text-[var(--admin-heading)]">Revenue</h1>
					<p className="text-xs text-[var(--admin-text-soft)]">Track your clinic's revenue and financial insights.</p>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as RevenueDateFilter)} className="admin-revenue-date-select rounded-lg border border-line bg-[var(--admin-surface-strong)] px-2.5 py-2 text-xs text-[var(--admin-text)] focus:border-[var(--admin-link)] focus:outline-none" aria-label="Revenue date range">
						{filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
					</select>
					{dateFilter === "custom" ? <input type="date" value={customDate} onChange={(event) => setCustomDate(event.target.value)} className="admin-revenue-date-select rounded-lg border border-line bg-[var(--admin-surface-strong)] px-2.5 py-2 text-xs text-[var(--admin-text)] focus:border-[var(--admin-link)] focus:outline-none" aria-label="Custom revenue date" /> : null}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<SummaryCard label="Total Revenue" value={isLoading ? "..." : formatCurrency(totalRevenue)} detail="From completed appointments" icon="revenue" theme="admin-revenue-card admin-revenue-card-revenue border-emerald-200 bg-emerald-50 text-emerald-800" />
				<SummaryCard label="Paid Appointments" value={isLoading ? "..." : paidAppointments.length.toLocaleString("en-IN")} detail="Completed appointments" icon="appointments" theme="admin-revenue-card admin-revenue-card-paid border-sky-200 bg-sky-50 text-sky-800" />
				<SummaryCard label="Average Appointment Value" value={isLoading ? "..." : formatCurrency(averageRevenue)} detail="Per paid appointment" icon="average" theme="admin-revenue-card admin-revenue-card-average border-amber-200 bg-amber-50 text-amber-800" />
				<SummaryCard label="Pending Appointments" value={isLoading ? "..." : pendingAppointments.toLocaleString("en-IN")} detail="Awaiting confirmation" icon="pending" theme="admin-revenue-card admin-revenue-card-pending border-rose-200 bg-rose-50 text-rose-800" />
			</div>

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
			<section className="rounded-card border border-line bg-[var(--admin-surface-strong)] p-4 shadow-sm sm:p-5 xl:col-span-3" aria-labelledby="monthly-revenue-heading">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 id="monthly-revenue-heading" className="text-base font-semibold text-[var(--admin-heading)]">Monthly Revenue</h2>
								<p className="mt-1 text-xs text-[var(--admin-text-soft)]">Revenue from completed appointments in the selected range.</p>
					</div>
					<div className="flex items-center gap-1 rounded-lg border border-line bg-[var(--admin-surface)] p-1" aria-label="Chart type">
						{(["bar", "line", "area"] as ChartType[]).map((type) => (
							<button key={type} type="button" onClick={() => setChartType(type)} className={`rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors ${chartType === type ? "bg-[var(--admin-link)] text-white" : "text-[var(--admin-text-soft)] hover:text-[var(--admin-text)]"}`}>{type}</button>
						))}
					</div>
				</div>
				{error ? <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p> : null}
				<RevenueChart data={monthlyRevenue} chartType={chartType} />
				{!isLoading && totalRevenue === 0 ? <p className="mt-3 text-center text-xs text-[var(--admin-text-soft)]">No completed appointment revenue recorded yet.</p> : null}
			</section>
			<section className="rounded-card border border-line bg-[var(--admin-surface-strong)] p-4 shadow-sm sm:p-5 xl:col-span-2" aria-labelledby="revenue-treatment-heading">
				<h2 id="revenue-treatment-heading" className="text-base font-semibold text-[var(--admin-heading)]">Revenue by Treatment</h2>
				<p className="mt-1 text-xs text-[var(--admin-text-soft)]">Distribution of completed appointment revenue.</p>
				<RevenueByTreatment data={treatmentRevenue} total={totalRevenue} />
			</section>
			</div>

			<section className="overflow-hidden rounded-card border border-line bg-[var(--admin-surface-strong)] p-4 shadow-sm sm:p-5" aria-labelledby="revenue-details-heading">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 id="revenue-details-heading" className="text-base font-semibold text-[var(--admin-heading)]">Revenue Details</h2>
						<p className="mt-1 text-xs text-[var(--admin-text-soft)]">Completed appointments with configured treatment pricing.</p>
					</div>
					<div className="flex items-center gap-2">
						<select value={treatmentFilter} onChange={(event) => setTreatmentFilter(event.target.value)} className="max-w-44 rounded-lg border border-line bg-[var(--admin-surface-strong)] px-2.5 py-2 text-xs text-[var(--admin-text)] focus:border-[var(--admin-link)] focus:outline-none" aria-label="Filter revenue by treatment">
							<option value="all">All treatments</option>
							{treatments.filter((treatment) => treatment.price !== null && Number(treatment.price) > 0).map((treatment) => <option key={treatment.name} value={treatment.name.trim().toLowerCase()}>{treatment.name}</option>)}
						</select>
						<button type="button" onClick={exportRevenueDetails} disabled={isLoading || !displayedAppointments.length} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface)] disabled:cursor-not-allowed disabled:opacity-50">Export</button>
					</div>
				</div>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full min-w-[720px] border-collapse text-left text-xs">
						<thead>
							<tr className="border-y border-line text-[10px] uppercase tracking-wide text-[var(--admin-text-soft)]">
								<th className="px-3 py-2.5 font-semibold">Date</th><th className="px-3 py-2.5 font-semibold">Patient</th><th className="px-3 py-2.5 font-semibold">Treatment</th><th className="px-3 py-2.5 font-semibold">Amount</th><th className="px-3 py-2.5 font-semibold">Payment</th><th className="px-3 py-2.5 font-semibold">Doctor</th>
							</tr>
						</thead>
						<tbody>
							{displayedAppointments.map((appointment) => <tr key={appointment.id} className="border-b border-line last:border-b-0">
								<td className="px-3 py-3 text-[var(--admin-text-soft)]">{formatRevenueDate(appointment.preferred_date)}</td>
								<td className="px-3 py-3 font-medium text-[var(--admin-text)]">{appointment.patient_name}</td>
								<td className="px-3 py-3 text-[var(--admin-text)]">{appointment.treatment}</td>
								<td className="px-3 py-3 font-semibold text-[var(--admin-heading)]">{formatCurrency(getAppointmentAmount(appointment, revenueByTreatment))}</td>
								<td className="px-3 py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">Paid</span></td>
								<td className="px-3 py-3 text-[var(--admin-text-soft)]">Not assigned</td>
							</tr>)}
						</tbody>
					</table>
					{isLoading ? <p className="px-3 py-8 text-center text-sm text-[var(--admin-text-soft)]">Loading revenue data...</p> : !displayedAppointments.length ? <p className="px-3 py-8 text-center text-sm text-[var(--admin-text-soft)]">No completed appointment records found.</p> : null}
				</div>
			</section>
		</div>
	);
}
