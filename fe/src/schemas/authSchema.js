import { z } from 'zod';

// Schema validation cho login form - đơn giản, chỉ yêu cầu không để trống
export const loginSchema = z.object({
    username: z
        .string()
        .min(1, 'Vui lòng nhập tên đăng nhập'),
    password: z
        .string()
        .min(1, 'Vui lòng nhập mật khẩu'),
});

// Schema validation cho register form - đơn giản
export const registerSchema = z
    .object({
        username: z
            .string()
            .min(1, 'Vui lòng nhập tên đăng nhập'),
        password: z
            .string()
            .min(1, 'Vui lòng nhập mật khẩu'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    });

// Tính độ mạnh của password
export const calculatePasswordStrength = (password) => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;

    // Character variety
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    return Math.min(strength, 100);
};

// Get password strength label and color
export const getPasswordStrengthInfo = (strength) => {
    if (strength === 0) return { label: '', color: 'bg-slate-700' };
    if (strength < 40) return { label: 'Yếu', color: 'bg-red-500' };
    if (strength < 70) return { label: 'Trung bình', color: 'bg-yellow-500' };
    if (strength < 90) return { label: 'Khá', color: 'bg-blue-500' };
    return { label: 'Mạnh', color: 'bg-green-500' };
};
