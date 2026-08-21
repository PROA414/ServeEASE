export default function BookingCancelledEmail({
  bookingId,
  cancelledByName,
  date,
  credits,
}: {
  bookingId: string;
  cancelledByName: string;
  date: string;
  credits: number;
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#dc2626", fontSize: "24px", marginBottom: "16px" }}>Booking Cancelled</h1>
      <p style={{ color: "#374151", fontSize: "16px", lineHeight: "1.6" }}>
        A booking has been cancelled by <strong>{cancelledByName}</strong>.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "24px", marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Booking ID</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontFamily: "monospace" }}>{bookingId}</td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Date</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>{date}</td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0", fontWeight: "bold" }}>Credits Refunded</td>
            <td style={{ padding: "12px 0", fontWeight: "bold", color: "#dc2626" }}>{credits} credits</td>
          </tr>
        </tbody>
      </table>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        The scheduled date is now free. If you have questions, reach out through the app chat.
      </p>
    </div>
  );
}
