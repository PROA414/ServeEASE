export default function NewBookingAlertEmail({
  bookingId,
  buyerName,
  date,
  duration,
  credits,
}: {
  bookingId: string;
  buyerName: string;
  date: string;
  duration: string;
  credits: number;
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#2563eb", fontSize: "24px", marginBottom: "16px" }}>New Booking Received</h1>
      <p style={{ color: "#374151", fontSize: "16px", lineHeight: "1.6" }}>
        You have a new booking from <strong>{buyerName}</strong>.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "24px", marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Booking ID</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontFamily: "monospace" }}>{bookingId}</td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Buyer</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>{buyerName}</td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Date</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>{date}</td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Duration</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>{duration}</td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0", fontWeight: "bold" }}>Payout on Completion</td>
            <td style={{ padding: "12px 0", fontWeight: "bold", color: "#2563eb" }}>{credits} credits</td>
          </tr>
        </tbody>
      </table>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Log in to your dashboard to view booking details and chat with the buyer.
      </p>
    </div>
  );
}
