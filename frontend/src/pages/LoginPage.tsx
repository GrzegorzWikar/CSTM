import { Link, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { useAuth } from "../auth/useAuth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiError } from "../api/apiErrors";

const loginSchema = z.object({
    email: z.string().trim().min(1, 'Email address is required.').email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required.')
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginLocationState{
    from?: string,
    registrationCompleted?: boolean;
}

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [submitError, setSubmitError] = useState<string | null>();

    const locationState = location.state as LoginLocationState | null;

    const destination = locationState?.from?.startsWith('/') ? locationState.from : '/tickets';

    const {register, handleSubmit, fromState: {errors, isSubmitting}} = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    async function onSubmit(value: LoginFormValues) : Promise<void> {
        setSubmitError(null);

        try{
            await login({
                email: value.email,
                password: value.password,
            });

            navigate(destination, {
                replace: true
            });
        }catch (error: unknown){
            const apiError = getApiError(error);

            setSubmitError(apiError.message);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="login-heading">
                <div className="auth-card_brand" aria-hidden="true">
                    CS
                </div>

                <p className="eyebrow">Cloud Support Ticket Manager</p>

                <h1 id="login-heading">Sing in</h1>

                <p className="auth-card__description">
                    Sign in to manage Azure support ticket.
                </p>

                {locationState?.registrationCompleted && (
                    <div className="form-message form-message--success" role="staus">
                        Account created successfully. You can now sign in.
                    </div>
                )}

                {submitError && (
                    <div className="form-message form-message--error" role="alert">
                        {submitError}
                    </div>
                )}

                <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-fiel">
                        <label htmlFor="login-email">
                            Email address
                        </label>
                        <input id="login-email" 
                            type="email" 
                            aria-invalid={Boolean(errors.email)} 
                            aria-describedby={ errors.email ? 'login-email-error' : undefined } 
                            {...register('email')} />

                        {errors.email && (
                            <p className="form-field__error" id="login-email-error" role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    
                    <div className="form-field">
                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input 
                            id="login-password"
                            type="password"
                            autoComplete="current password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={ errors.password ? 'login-password-error' : undefined }
                            {...register('password')} />

                        {errors.password && (
                            <p className="form-field__error" id="login-password-error" role="alert">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button className="button button--primary auth-form__submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Do not have an account?{' '}
                    <Link className="text-link" to='/register'>
                        Create account
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default LoginPage;