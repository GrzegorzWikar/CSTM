import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';
import { getApiError } from '../api/apiErrors';
import { useAuth } from '../auth/useAuth';

const registerSchema = z.object({ email: z.string().trim().min(1, 'Email address is required.').email('Enter a valid email address.'),
                                password: z.string().min(1, 'Password is required.').min(6, 'Password must contain at least 6 characters.'),
                            confirmPassword: z.string().min(1, 'Confirm your password.') })
                            .refine((values) => values.password === values.confirmPassword, {message: 'Passwords do not match.', path: ['confirmPassword']});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterPage() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();

    const [submitError, setSubmitError] = useState<string | null>(null);

    const {register, handleSubmit, setError, fromState: {errors, isSubmitting}} = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    async function onSubmit(values: RegisterFormValues): Promise<void> {
        setSubmitError(null);

        try{
            await registerUser({
                email: values.email,
                password: values.password
            });

            navigate('/login', {
                replace: true,
                state: {
                    registrationCompleted: true
                }
            });
        }catch (error: unknown) {
            const apiError = getApiError(error);

            for (const [fieldName, messages] of Object.entries(apiError.fieldErrors)){
                const normalizedFieldName = fieldName.toLowerCase();

                if (normalizedFieldName.includes('email') && messages[0]){
                    setError('email', { type: 'server', message: messages[0]});
                }

                if (normalizedFieldName.includes('password') && messages[0]){
                    setError('password', { type: 'server', message: messages[0]});
                }
            }
            setSubmitError(apiError.message);
        }
    }

    return(
        <main className='auth-page'>
            <section className='auth-card' aria-labelledby='register-heading'>
                <div className='auth-card__brand' aria-hidden='true'>
                    CS
                </div>

                <p className='eyebrow'>Cloud Support Ticket Menager</p>
                
                <h1 id='register-heading'>Create account</h1>

                <p className='auth-card__description'>
                    Create an account to submit and track support tickets.
                </p>

                {submitError && (
                    <div className='form-message form-message--error' role="alert">
                        { submitError }
                    </div>
                )}

                <form className='auth-form' noValidate onSubmit={handleSubmit(onSubmit)}>
                    <div className='form-field'>
                        <label htmlFor='register-email'>
                            Email address
                        </label>

                        <input
                            id='register-email'
                            type='email'
                            autoComplete='email'
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'register-email-error' : undefined}
                            {...register('email')} />

                        {errors.email && (
                            <p className='form-field__error' id='register-email-error' role='alert'>
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className='form-field'>
                        <label htmlFor='register-password'>
                            Password
                        </label>

                        <input
                            id='register-password'
                            type='password'
                            autoComplete='new-password'
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'register-password-error' : undefined}
                            {...register('password')} />

                        {errors.password && (
                            <p className='form-field__error' id='register-password-error' role='alert'>
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className='form-field'>
                        <label htmlFor='register-confirm-password'>
                            Confirm password
                        </label>

                        <input
                            id='register-confirm-password'
                            type='password'
                            autoComplete='new-password'
                            aria-invalid={Boolean(errors.confirmPassword ? 'register-confirm-password-error' : undefined)}
                            {...register('confirmPassword')} />
                        
                        {errors.confirmPassword && (
                            <p className='form-field__error' id='register-confirm-password-error' role='alert'>
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <button className='button button--primary auth-form__submit' type='submit' disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className='auth-card__footer'>
                    Alredy have an account?{' '}
                    <Link className='text-link' to="/login">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default RegisterPage;