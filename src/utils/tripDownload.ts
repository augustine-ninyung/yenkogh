import type { BudgetItem, Festival, Itinerary, TripAccommodation } from '@/types';
import { getTripCosts } from '@/utils/tripPlanning';

export interface TripDocument {
  title: string;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  destinations: string[];
  itinerary: Itinerary;
  stays: TripAccommodation[];
  festival?: Festival;
  budget?: number;
  /** Costs the traveller added to the plan themselves */
  extras?: BudgetItem[];
}

// The PDF's built-in fonts only cover Latin-1, so other characters are replaced
const toPdfText = (text: string) =>
  text
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/₵/g, 'GHS ')
    .replace(/ɛ/g, 'e')
    .replace(/ɔ/g, 'o')
    .replace(/Ɛ/g, 'E')
    .replace(/Ɔ/g, 'O')
    .replace(/ŋ/g, 'ng')
    .replace(/ɣ/g, 'g')
    .replace(/[^\x20-\xFF]/g, '');

const money = (amount: number) => `GHS ${Math.round(amount).toLocaleString('en-GH')}`;

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** Builds the trip as a PDF and downloads it to the traveller's device. */
export async function downloadTripPdf(trip: TripDocument): Promise<void> {
  // Loaded on demand so the PDF library stays out of the main bundle
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const write = (
    text: string,
    opts: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; gap?: number } = {},
  ) => {
    const { size = 10, bold = false, color = [38, 43, 50], indent = 0, gap = 1.5 } = opts;
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lineHeight = size * 0.45;
    for (const line of doc.splitTextToSize(toPdfText(text), contentWidth - indent) as string[]) {
      ensureSpace(lineHeight);
      doc.text(line, margin + indent, y + lineHeight * 0.8);
      y += lineHeight;
    }
    y += gap;
  };

  /** A label on the left with an amount right-aligned on the same line. */
  const writeRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.setTextColor(38, 43, 50);
    ensureSpace(6);
    doc.text(toPdfText(label), margin, y + 4);
    doc.text(toPdfText(value), pageWidth - margin, y + 4, { align: 'right' });
    y += 6;
  };

  const heading = (text: string) => {
    y += 3;
    ensureSpace(12);
    write(text, { size: 13, bold: true, gap: 1 });
    doc.setDrawColor(255, 211, 0);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  const grey: [number, number, number] = [117, 123, 129];
  const extras = trip.extras ?? [];
  const costs = getTripCosts(trip.itinerary, trip.stays, trip.numberOfTravelers, extras);

  // Title block
  doc.setFillColor(255, 211, 0);
  doc.rect(0, 0, pageWidth, 5, 'F');
  y = 14;
  write('YenkoGH trip plan', { size: 9, bold: true, color: grey, gap: 1 });
  write(trip.title, { size: 18, bold: true, gap: 2 });
  write(
    `${longDate(trip.startDate)} to ${longDate(trip.endDate)}  |  ${trip.itinerary.days.length} days  |  ` +
      `${trip.numberOfTravelers} ${trip.numberOfTravelers === 1 ? 'traveller' : 'travellers'}`,
    { color: grey },
  );
  if (trip.destinations.length > 0) write(`Stops: ${trip.destinations.join(', ')}`, { color: grey });

  if (trip.festival) {
    const f = trip.festival;
    heading(`Festival: ${f.name}`);
    const where = [f.town, `${f.region} Region`].filter(Boolean).join(', ');
    write(`Where: ${where}`);
    if (f.usualDate || f.month) write(`Usually held: ${f.usualDate || f.month}`);
    if (f.duration) write(`Duration: ${f.duration}`);
    if (f.description) write(f.description, { color: grey });
    if (f.activities.length > 0) write(`What happens: ${f.activities.join('; ')}.`, { color: grey });
  }

  heading('Cost estimate');
  writeRow('Activities, meals and transport', money(costs.itinerary));
  if (trip.stays.length > 0) writeRow('Places to stay', money(costs.stays));
  for (const e of extras) writeRow(e.name, money(e.amount));
  writeRow('Estimated total', money(costs.total), true);
  if (trip.budget) {
    const diff = trip.budget - costs.total;
    writeRow('Your budget', money(trip.budget));
    writeRow(diff >= 0 ? 'Under budget by' : 'Over budget by', money(Math.abs(diff)), true);
  }
  y += 1;
  write('All amounts are estimates in Ghana cedis, not quoted prices.', { size: 8, color: grey });

  if (trip.stays.length > 0) {
    heading('Where you are staying');
    for (const s of trip.stays) {
      ensureSpace(14);
      write(`${s.name} (${s.type}), ${s.town}`, { bold: true, gap: 0.5 });
      write(
        `For ${s.stop}: ${s.nights} ${s.nights === 1 ? 'night' : 'nights'}, ${s.rooms} ${s.rooms === 1 ? 'room' : 'rooms'}, ` +
          `about ${money(s.pricePerNight)} per room per night = ${money(s.nights * s.rooms * s.pricePerNight)}`,
        { color: grey, gap: 2.5 },
      );
    }
    write('Stays are suggestions only. Nothing has been booked; check availability and rates with the property.', {
      size: 8,
      color: grey,
    });
  }

  heading('Day by day');
  for (const day of trip.itinerary.days) {
    ensureSpace(20);
    write(`Day ${day.day}: ${day.location}${day.date ? `  (${longDate(day.date)})` : ''}`, { size: 11, bold: true, gap: 1.5 });
    for (const item of day.items) {
      ensureSpace(10);
      const cost = item.cost ? `  -  ${money(item.cost)}` : '';
      write(`${item.time || '--:--'}   ${item.title}${cost}`, { bold: true, indent: 3, gap: 0.3 });
      if (item.description) write(item.description, { size: 9, color: grey, indent: 16, gap: 1.8 });
    }
    y += 2;
  }

  // Page numbers
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...grey);
    doc.text(`Page ${p} of ${pages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    doc.text('Generated by YenkoGH', margin, pageHeight - 8);
  }

  const fileName = toPdfText(trip.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip';
  doc.save(`${fileName}.pdf`);
}
