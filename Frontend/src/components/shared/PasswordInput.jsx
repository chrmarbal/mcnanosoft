import { useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import '../../css/PasswordInput.css'

function PasswordInput({ material = false, ...props }) {
    const [visible, setVisible] = useState(false)
    const toggleButton = (
        <IconButton
            type="button"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setVisible(show => !show)}
            edge="end"
            size="small"
        >
            {visible ? <VisibilityOff /> : <Visibility />}
        </IconButton>
    )

    if (material) {
        const { InputProps, ...textFieldProps } = props
        return (
            <TextField
                {...textFieldProps}
                type={visible ? 'text' : 'password'}
                InputProps={{
                    ...InputProps,
                    endAdornment: <InputAdornment position="end">{toggleButton}</InputAdornment>
                }}
            />
        )
    }

    return (
        <div className="passwordInput">
            <input {...props} type={visible ? 'text' : 'password'} />
            {toggleButton}
        </div>
    )
}

export default PasswordInput
