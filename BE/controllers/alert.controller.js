const { sendEmail } = require('../services/mail.service');

const checkTemperatureAlert = async (temperature, userEmail) => {
    console.log("CẢNH BÁO: Nhiệt độ quá cao!");

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: red;">CẢNH BÁO NHIỆT ĐỘ</h2>
            <p>Hệ thống phát hiện nhiệt độ tại vườn đang ở mức cao.</p>
            <ul>
                <li><strong>Giá trị đo được:</strong> ${temperature}°C</li>
                <li><strong>Thời gian:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>Vui lòng kiểm tra ngay lập tức!</p>
        </div>
    `;

    await sendEmail(userEmail, "CẢNH BÁO KHẨN CẤP - IoT System", htmlContent);
};
module.exports = { checkTemperatureAlert };