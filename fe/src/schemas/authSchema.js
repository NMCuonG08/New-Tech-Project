import { z } from 'zod';

// Schema validation cho login form
export const loginSchema = z.object({
    username: z
        .string()
        .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
        .max(20, 'Tên đăng nhập không được quá 20 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới'),
    password: z
        .string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .max(50, 'Mật khẩu không được quá 50 ký tự'),
});

// Schema validation cho register form
export const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
            .max(20, 'Tên đăng nhập không được quá 20 ký tự')
            .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới'),
        password: z
            .string()
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .max(50, 'Mật khẩu không được quá 50 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
        confirmPassword: z.string(),
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
