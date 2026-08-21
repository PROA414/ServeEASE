export default function PaymentReleasedEmail({
  bookingId,
  credits,
}: {
  bookingId: string;
  credits: number;
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "#16a34a", fontSize: "24px", marginBottom: "16px" }}>Payment Released</h1>
      <p style={{ color: "#374151", fontSize: "16px", lineHeight: "1.6" }}>
        Great news! The buyer has released payment for booking <strong>{bookingId}</strong>.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "24px", marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontWeight: "bold" }}>Booking ID</td>
            <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", fontFamily: "monospace" }}>{bookingId}</td>
          </tr>
          <tr>
            <td style={{ padding: "12px 0", fontWeight: "bold" }}>Credits Paid</td>
            <td style={{ padding: "12px 0", fontWeight: "bold", color: "#16a34a" }}>{credits} credits</td>
          </tr>
        </tbody>
      </table>
      <p style={{ color: "#6b7280", fontSize: "14px" }}>
        The credits have been added to your wallet. Thank you for using SearveEASE.
      </p>
    </div>
  );
}
