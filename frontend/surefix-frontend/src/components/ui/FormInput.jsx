import React from 'react';
import { User, Mail, Phone, Lock } from 'lucide-react';

const icons = {
    user: User,
    mail: Mail,
    phone: Phone,
    lock: Lock,
    // Add more as needed
};

const FormInput = ({ id, label, icon, type = 'text', placeholder, value, onChange, required, className = '', error, ...props }) => {
    const IconComp = icons[icon];

    return (
        <div className="sf-form-group">
            {label && (
                <label htmlFor={id} className="sf-label">
                    {label}
                </label>
            )}
            <div className="relative">
                {IconComp && (
                    <span className="sf-input-icon" id={`ico-${id}`}>
                        <IconComp size={14} />
                    </span>
                )}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`sf-input ${error ? 'sf-input-error' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="sf-input-error-text">{error}</p>}
        </div>
    );
};

export default FormInput;

