package com.shifting.service;

import com.shifting.model.Booking;
import com.shifting.model.BookingItem;
import com.shifting.model.Payment;
import com.shifting.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ─────────────────────────────────────────────────────────────────────────
    // 1. WELCOME EMAIL
    // ─────────────────────────────────────────────────────────────────────────
    @Async
    public void sendWelcomeEmail(User user) {
        try {
            send(user.getEmail(),
                    "Welcome to LiftNShift — Your Home, Our Mission",
                    buildWelcomeHtml(user));
            log.info("Welcome email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. BOOKING CREATED EMAIL
    // ─────────────────────────────────────────────────────────────────────────
    @Async
    public void sendBookingCreatedEmail(User user, Booking booking) {
        try {
            send(user.getEmail(),
                    "Booking #" + pad(booking.getId()) + " Created — LiftNShift",
                    buildBookingCreatedHtml(user, booking));
            log.info("Booking created email sent → booking #{}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send booking created email: {}", e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. PAYMENT CONFIRMED EMAIL
    // ─────────────────────────────────────────────────────────────────────────
    @Async
    public void sendPaymentConfirmedEmail(User user, Booking booking,
                                          Payment payment, List<BookingItem> items) {
        try {
            send(user.getEmail(),
                    "Confirmed & Payment Received — LiftNShift #" + pad(booking.getId()),
                    buildPaymentConfirmedHtml(user, booking, payment, items));
            log.info("Payment confirmed email sent → booking #{}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send payment confirmed email: {}", e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. BOOKING CANCELLED EMAIL
    // ─────────────────────────────────────────────────────────────────────────
    @Async
    public void sendBookingCancelledEmail(User user, Booking booking) {
        try {
            send(user.getEmail(),
                    "Booking #" + pad(booking.getId()) + " Cancelled — LiftNShift",
                    buildBookingCancelledHtml(user, booking));
            log.info("Booking cancelled email sent → booking #{}", booking.getId());
        } catch (Exception e) {
            log.error("Failed to send booking cancelled email: {}", e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CORE SENDER
    // ─────────────────────────────────────────────────────────────────────────
    private void send(String to, String subject, String html) throws MessagingException {
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
        h.setFrom(fromEmail, "LiftNShift");
        h.setTo(to);
        h.setSubject(subject);
        h.setText(html, true);
        mailSender.send(msg);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEMPLATE BUILDERS
    // ─────────────────────────────────────────────────────────────────────────

    private String buildWelcomeHtml(User user) {
        return page(
                logo() +
                        h1("Welcome to LiftNShift!") +
                        p("Hi <strong>" + user.getName() + "</strong>,") +
                        p("We're thrilled to have you on board. LiftNShift makes home " +
                                "relocation simple, transparent, and stress-free.") +
                        infoBox(
                                row("Name",  user.getName()) +
                                        row("Email", user.getEmail()) +
                                        row("Phone", user.getPhone())
                        ) +
                        p("Here's what you can do with LiftNShift:") +
                        bullets(new String[]{
                                "Create a home shifting booking in under 2 minutes",
                                "Add furniture and appliances from our smart catalog",
                                "Pay securely via UPI, card, or net banking",
                                "Track your booking status in real time"
                        }) +
                        cta(frontendUrl + "/dashboard", "Go to Dashboard") +
                        hr() +
                        p("If you have any questions, just reply to this email.") +
                        sign()
        );
    }

    private String buildBookingCreatedHtml(User user, Booking booking) {
        return page(
                logo() +
                        h1("Booking Created Successfully") +
                        p("Hi <strong>" + user.getName() + "</strong>,") +
                        p("Your home shifting booking has been created. " +
                                "Add your items and complete payment to confirm the booking.") +
                        infoBox(
                                row("Booking ID", "#" + pad(booking.getId())) +
                                        row("Status",     badge("PENDING", "#F47B20")) +
                                        row("Pickup",     booking.getPickupAddress()) +
                                        row("Drop",       booking.getDropAddress()) +
                                        row("Created",    booking.getCreatedAt() != null
                                                ? booking.getCreatedAt().format(DATE_FMT) : "—")
                        ) +
                        callout("Next Step",
                                "Add your items and complete payment to confirm this booking.") +
                        cta(frontendUrl + "/bookings/" + booking.getId() + "/confirm",
                                "Review &amp; Pay Now") +
                        hr() +
                        p("If you didn't create this booking, please ignore this email.") +
                        sign()
        );
    }

    private String buildPaymentConfirmedHtml(User user, Booking booking,
                                             Payment payment, List<BookingItem> items) {
        StringBuilder itemRows = new StringBuilder();
        for (BookingItem item : items) {
            String name = item.getPredefinedItem() != null
                    ? item.getPredefinedItem().getName()
                    : item.getCustomName();
            String size = item.getSize() != null ? " (" + item.getSize() + ")" : "";
            itemRows.append(itemRow(name + size,
                    "× " + item.getQuantity(),
                    rupees(item.getPrice())));
        }

        BigDecimal subtotal = items.stream()
                .map(BookingItem::getPrice)
                .filter(p -> p != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax   = subtotal.multiply(BigDecimal.valueOf(0.05))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);

        return page(
                logo() +
                        successBanner() +
                        h1("Booking Confirmed!") +
                        p("Hi <strong>" + user.getName() + "</strong>,") +
                        p("Your payment was successful and your home shifting booking has " +
                                "been confirmed. Our team will contact you shortly to schedule " +
                                "the moving date.") +

                        label("Booking Details") +
                        infoBox(
                                row("Booking ID", "#" + pad(booking.getId())) +
                                        row("Status",     badge("CONFIRMED", "#3B9EFF")) +
                                        row("Pickup",     booking.getPickupAddress()) +
                                        row("Drop",       booking.getDropAddress()) +
                                        row("Confirmed",  booking.getCreatedAt() != null
                                                ? booking.getCreatedAt().format(DATE_FMT) : "—")
                        ) +

                        label("Items") +
                        itemsTable(itemRows.toString()) +

                        label("Payment Summary") +
                        infoBox(
                                row("Payment ID",           payment.getRazorpayPaymentId()) +
                                        row("Method",               capitalize(payment.getPaymentMethod())) +
                                        row("Subtotal",             rupees(subtotal)) +
                                        row("Service Charge (5%)",  rupees(tax)) +
                                        row("Total Paid",
                                                "<strong style='color:#F47B20;font-size:16px'>"
                                                        + rupees(total) + "</strong>")
                        ) +

                        callout("What happens next?",
                                "Our team will call you at <strong>" + user.getPhone() +
                                        "</strong> to confirm the shifting date and time.") +

                        cta(frontendUrl + "/bookings/" + booking.getId() + "/detail",
                                "View Booking Details") +
                        hr() +
                        p("Thank you for choosing LiftNShift. We look forward to making " +
                                "your move smooth and hassle-free.") +
                        sign()
        );
    }

    private String buildBookingCancelledHtml(User user, Booking booking) {
        return page(
                logo() +
                        h1("Booking Cancelled") +
                        p("Hi <strong>" + user.getName() + "</strong>,") +
                        p("Your booking has been cancelled as requested.") +
                        infoBox(
                                row("Booking ID", "#" + pad(booking.getId())) +
                                        row("Status",     badge("CANCELLED", "#F87171")) +
                                        row("Pickup",     booking.getPickupAddress()) +
                                        row("Drop",       booking.getDropAddress())
                        ) +
                        callout("Changed your mind?",
                                "You can create a new booking anytime from your dashboard.") +
                        cta(frontendUrl + "/bookings/new", "Create New Booking") +
                        hr() +
                        p("If you have any questions, reply to this email and we'll " +
                                "get back to you.") +
                        sign()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HTML BUILDING BLOCKS
    // ─────────────────────────────────────────────────────────────────────────

    private String page(String body) {
        return "<!DOCTYPE html><html lang='en'><head>" +
                "<meta charset='UTF-8'/>" +
                "<meta name='viewport' content='width=device-width,initial-scale=1.0'/>" +
                "<title>LiftNShift</title></head>" +
                "<body style='margin:0;padding:0;background:#f4f4f4;" +
                "font-family:Helvetica Neue,Helvetica,Arial,sans-serif;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0' " +
                "style='background:#f4f4f4;padding:32px 0;'><tr><td align='center'>" +
                "<table width='600' cellpadding='0' cellspacing='0' " +
                "style='max-width:600px;width:100%;background:#ffffff;" +
                "border-radius:16px;overflow:hidden;" +
                "box-shadow:0 4px 24px rgba(0,0,0,0.08);'>" +
                "<tr><td style='padding:0;'>" + body + "</td></tr></table>" +
                "<p style='margin:20px 0 0;font-size:12px;color:#aaa;text-align:center;'>" +
                "LiftNShift &middot; Home Relocation Services &middot; Built by Om &amp; Shreyash &middot; &copy; 2025" +
                "</p></td></tr></table></body></html>";
    }

    private String logo() {
        return "<div style='background:#0d0d0d;padding:28px 40px;text-align:center;'>" +
                "<span style='font-size:26px;font-weight:900;letter-spacing:3px;" +
                "color:#ffffff;'>LIFT</span>" +
                "<span style='font-size:26px;font-weight:900;letter-spacing:3px;" +
                "color:#F47B20;'>N</span>" +
                "<span style='font-size:26px;font-weight:900;letter-spacing:3px;" +
                "color:#ffffff;'>SHIFT</span>" +
                "<p style='margin:6px 0 0;font-size:10px;letter-spacing:4px;" +
                "color:#555;text-transform:uppercase;'>Home Relocation Services</p>" +
                "</div>";
    }

    private String successBanner() {
        return "<div style='background:#0f2a1a;padding:22px;text-align:center;'>" +
                "<div style='display:inline-block;width:52px;height:52px;" +
                "border-radius:50%;background:rgba(52,211,153,0.15);" +
                "border:2px solid #34D399;text-align:center;line-height:52px;" +
                "font-size:22px;color:#34D399;'>&#10003;</div>" +
                "<p style='margin:8px 0 0;color:#34D399;font-size:12px;" +
                "letter-spacing:3px;text-transform:uppercase;font-weight:700;'>" +
                "Payment Successful</p></div>";
    }

    private String h1(String text) {
        return "<div style='padding:32px 40px 4px;'>" +
                "<h1 style='margin:0;font-size:24px;font-weight:700;" +
                "color:#1a1a1a;line-height:1.3;'>" + text + "</h1></div>";
    }

    private String label(String text) {
        return "<div style='padding:20px 40px 6px;'>" +
                "<p style='margin:0;font-size:11px;font-weight:700;" +
                "color:#999;text-transform:uppercase;letter-spacing:2px;'>"
                + text + "</p></div>";
    }

    private String p(String text) {
        return "<div style='padding:8px 40px;'>" +
                "<p style='margin:0;font-size:15px;color:#444;line-height:1.7;'>"
                + text + "</p></div>";
    }

    private String infoBox(String rows) {
        return "<div style='margin:12px 40px;border:1px solid #ebebeb;" +
                "border-radius:10px;overflow:hidden;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0'>"
                + rows + "</table></div>";
    }

    private String row(String label, String value) {
        return "<tr>" +
                "<td style='padding:11px 16px;font-size:12px;color:#999;" +
                "border-bottom:1px solid #f5f5f5;width:38%;font-weight:700;" +
                "text-transform:uppercase;letter-spacing:0.5px;" +
                "background:#fafafa;'>" + label + "</td>" +
                "<td style='padding:11px 16px;font-size:14px;color:#1a1a1a;" +
                "border-bottom:1px solid #f5f5f5;'>" + value + "</td></tr>";
    }

    private String itemsTable(String rows) {
        return "<div style='margin:12px 40px;border:1px solid #ebebeb;" +
                "border-radius:10px;overflow:hidden;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0'>" +
                "<tr style='background:#fafafa;'>" +
                "<th style='padding:10px 16px;font-size:11px;color:#999;" +
                "text-align:left;text-transform:uppercase;letter-spacing:1px;" +
                "font-weight:700;border-bottom:1px solid #ebebeb;'>Item</th>" +
                "<th style='padding:10px 16px;font-size:11px;color:#999;" +
                "text-align:center;text-transform:uppercase;letter-spacing:1px;" +
                "font-weight:700;border-bottom:1px solid #ebebeb;'>Qty</th>" +
                "<th style='padding:10px 16px;font-size:11px;color:#999;" +
                "text-align:right;text-transform:uppercase;letter-spacing:1px;" +
                "font-weight:700;border-bottom:1px solid #ebebeb;'>Price</th>" +
                "</tr>" + rows + "</table></div>";
    }

    private String itemRow(String name, String qty, String price) {
        return "<tr>" +
                "<td style='padding:11px 16px;font-size:14px;color:#1a1a1a;" +
                "border-bottom:1px solid #f5f5f5;'>" + name + "</td>" +
                "<td style='padding:11px 16px;font-size:14px;color:#666;" +
                "border-bottom:1px solid #f5f5f5;text-align:center;'>" + qty + "</td>" +
                "<td style='padding:11px 16px;font-size:14px;color:#F47B20;" +
                "border-bottom:1px solid #f5f5f5;text-align:right;" +
                "font-weight:600;'>" + price + "</td></tr>";
    }

    private String callout(String title, String body) {
        return "<div style='margin:16px 40px;background:#fff8f3;" +
                "border:1px solid #fde0c8;border-left:4px solid #F47B20;" +
                "border-radius:8px;padding:14px 16px;'>" +
                "<p style='margin:0 0 4px;font-size:13px;font-weight:700;" +
                "color:#c45e10;'>" + title + "</p>" +
                "<p style='margin:0;font-size:13px;color:#7a4020;line-height:1.6;'>"
                + body + "</p></div>";
    }

    private String bullets(String[] items) {
        StringBuilder sb = new StringBuilder(
                "<div style='padding:4px 40px;'><ul style='margin:0;padding-left:20px;'>");
        for (String item : items) {
            sb.append("<li style='font-size:14px;color:#444;" +
                    "line-height:1.8;padding:2px 0;'>").append(item).append("</li>");
        }
        return sb.append("</ul></div>").toString();
    }

    private String cta(String url, String text) {
        return "<div style='padding:24px 40px;text-align:center;'>" +
                "<a href='" + url + "' style='display:inline-block;" +
                "background:#F47B20;color:#ffffff;text-decoration:none;" +
                "padding:14px 36px;border-radius:8px;font-size:15px;" +
                "font-weight:700;letter-spacing:0.5px;" +
                "box-shadow:0 4px 14px rgba(244,123,32,0.35);'>"
                + text + "</a></div>";
    }

    private String badge(String status, String color) {
        return "<span style='display:inline-block;padding:3px 10px;" +
                "border-radius:20px;font-size:11px;font-weight:700;" +
                "letter-spacing:1px;text-transform:uppercase;" +
                "background:" + color + "22;color:" + color + ";'>"
                + status + "</span>";
    }

    private String hr() {
        return "<div style='margin:8px 40px;border-top:1px solid #f0f0f0;'></div>";
    }

    private String sign() {
        return "<div style='padding:16px 40px 32px;'>" +
                "<p style='margin:0;font-size:14px;color:#444;'>Warm regards,</p>" +
                "<p style='margin:4px 0 0;font-size:15px;font-weight:700;" +
                "color:#1a1a1a;'>The LiftNShift Team</p>" +
                "<p style='margin:2px 0 0;font-size:12px;color:#aaa;'>" +
                "Home Relocation Services &middot; Built by Om &amp; Shreyash</p></div>";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    private String pad(Long id) { return String.format("%04d", id); }

    private String rupees(BigDecimal amount) {
        if (amount == null) return "₹0.00";
        return "\u20B9" + String.format("%,.2f", amount);
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) return "Online";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }
}