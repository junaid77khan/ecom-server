import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url'; 

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function sendVerificationEmail(email, username, otp) {
    try {
        const templatePath = path.resolve(__dirname, 'VerficationEmail.hbs');
        const templateHtml = await fs.readFile(templatePath, 'utf8');

        const template = handlebars.compile(templateHtml);

        const emailHtml = template({ username, otp });

        let transporter = nodemailer.createTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'junaidk8185@gmail.com',
                pass: 'roqr snra jhmv buqi'
            },
            authMethod: 'plain'
        });

        let mailOptions = {
            from: 'junaidk8185@gmail.com',
            to: email,
            subject: 'Verification Code',
            html: emailHtml
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export { sendVerificationEmail };

