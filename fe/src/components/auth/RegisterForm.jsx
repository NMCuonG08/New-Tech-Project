import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { registerSchema, calculatePasswordStrength, getPasswordStrengthInfo } from '../../schemas/authSchema';
import { OAuth2Buttons } from './OAuth2Buttons';

export function RegisterForm({ onRegister, loading, error, onSwitchToLogin }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
    });

    const password = watch('password', '');
    const passwordStrength = calculatePasswordStrength(password);
    const strengthInfo = getPasswordStrengthInfo(passwordStrength);

    const onSubmit = async (data) => {
        // Chỉ gửi username và password, không gửi confirmPassword
        const { confirmPassword, ...submitData } = data;
        await onRegister(submitData);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur"
            >
                <div className="mb-6">
                    <h1 className="mb-2 text-2xl font-semibold">Đăng ký</h1>
                    <p className="text-sm text-slate-400">
                        Tạo tài khoản để sử dụng ứng dụng thời tiết.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 overflow-hidden rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Username Field */}
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            {...register('username')}
                            className={`w-full rounded-2xl border ${
                                errors.username ? 'border-red-500' : 'border-white/15'
                            } bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/60`}
                            placeholder="Nhập username"
                            autoComplete="username"
                        />
                        {errors.username && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 text-xs text-red-400"
                            >
                                {errors.username.message}
                            </motion.p>
                        )}
                    </div>

                    {/* Password Field with Strength Indicator */}
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className={`w-full rounded-2xl border ${
                                    errors.password ? 'border-red-500' : 'border-white/15'
                                } bg-slate-900 px-4 py-3 pr-12 text-sm text-slate-100 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/60`}
                                placeholder="Tối thiểu 8 ký tự"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                            >
                                {showPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                            clipRule="evenodd"
                                        />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${passwordStrength}%` }}
                                                transition={{ duration: 0.3 }}
                                                className={`h-full ${strengthInfo.color}`}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">{strengthInfo.label}</span>
                                </div>
                            </motion.div>
                        )}

                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 text-xs text-red-400"
                            >
                                {errors.password.message}
                            </motion.p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                className={`w-full rounded-2xl border ${
                                    errors.confirmPassword ? 'border-red-500' : 'border-white/15'
                                } bg-slate-900 px-4 py-3 pr-12 text-sm text-slate-100 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/60`}
                                placeholder="Nhập lại mật khẩu"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                            >
                                {showConfirmPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                            clipRule="evenodd"
                                        />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 text-xs text-red-400"
                            >
                                {errors.confirmPassword.message}
                            </motion.p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading || isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading || isSubmitting ? (
                            <>
                                <svg
                                    className="mr-2 h-4 w-4 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Đang đăng ký...
                            </>
                        ) : (
                            'Đăng ký'
                        )}
                    </motion.button>
                </form>

                {/* OAuth2 Buttons */}
                <OAuth2Buttons mode="register" />

                {/* Switch to Login */}
                {onSwitchToLogin && (
                    <p className="mt-6 text-center text-xs text-slate-400">
                        Đã có tài khoản?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="font-semibold text-blue-400 hover:text-blue-300"
                        >
                            Đăng nhập ngay
                        </button>
                    </p>
                )}
            </motion.div>
        </div>
    );
}


