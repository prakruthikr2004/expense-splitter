import nodemailer from "nodemailer";

export async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationLink = `https://splitmate-phi.vercel.app/verify-email/${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your SplitMate Account",
      html: `<p>Click the link below to verify your account:</p>
             <a href="${verificationLink}">${verificationLink}</a>`,
    });
    console.log("✅ Verification email sent to", email);
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    throw err; // so your signup route catches it
  }
}
