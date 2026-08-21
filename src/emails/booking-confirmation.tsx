export default function BookingConfirmationEmail({
  bookingId,
  providerName,
  date,
  duration,
  credits,
}: {
  bookingId: string;
  providerName: string;
  date: string;
  duration: string;
  credits: number;
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#2563eb", fontSize: "24px", marginBottom: "16px" }}>Booking Confirmed!</h1>
      <p style={{ color: "#374151", fontSize: "16px", lineHeight: "1.6" }}>
        Your booking with <strong>{providerName}</strong> has been confirmed. Your credits are held in escrow until the job is completed.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "24px", marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Booking ID</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontFamily: "monospace" }}>{bookingId}</td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Provider</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>{providerName}</td>
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
            <td style={{ padding: "12px 0", fontWeight: "bold" }}>Credits Held</td>
            <td style={{ padding: "12px 0", fontWeight: "bold", color: "#2563eb" }}>{credits} credits</td>
          </tr>
        </tbody>
      </table>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        Need to make changes? Contact your provider directly through the app chat.
      </p>
    </div>
  );
}
