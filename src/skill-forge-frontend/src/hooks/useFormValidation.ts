import { useCallback, useState } from 'react';
import { validateFullName, validateProfilePicture } from '../utils';

interface UseFormValidationProps {
    initialValues: Record<string, any>;
    validationRules: Record<string, (value: any) => { isValid: boolean; error?: string }>;
}

export const useFormValidation = ({ initialValues, validationRules }: UseFormValidationProps) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const setValue = useCallback((field: string, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    const setFieldTouched = useCallback((field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    }, []);

    const validate = useCallback((field?: string) => {
        const fieldsToValidate = field ? [field] : Object.keys(validationRules);
        const newErrors: Record<string, string> = { ...errors };

        fieldsToValidate.forEach(fieldName => {
            const validator = validationRules[fieldName];
            if (validator) {
                const result = validator(values[fieldName]);
                if (!result.isValid && result.error) {
                    newErrors[fieldName] = result.error;
                } else {
                    delete newErrors[fieldName];
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, validationRules, errors]);

    const validateAll = useCallback(() => {
        return validate();
    }, [validate]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        setValue,
        setFieldTouched,
        validate,
        validateAll,
        reset,
        isValid: Object.keys(errors).length === 0,
    };
};

// Specific hook for account setup form
export const useAccountSetupForm = () => {
    return useFormValidation({
        initialValues: {
            fullName: '',
            profilePicture: '',
        },
        validationRules: {
            fullName: validateFullName,
            profilePicture: (file: File) => file ? validateProfilePicture(file) : { isValid: true },
        },
    });
};
