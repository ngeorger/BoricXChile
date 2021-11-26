import Vue from 'vue'
import isEmail from 'validator/lib/isEmail'
import normalizeEmail from 'validator/lib/normalizeEmail'
import phoneValidator from 'phone'
import parameterize from './parameterize'


const methods = {
	$validarEmail (email) {
		try {
			const esValido = isEmail(email, {
				allow_display_name: false,
				allow_utf8_local_part: false,
				blacklisted_chars: '></;()'
			})
			return esValido && normalizeEmail(email)
		} catch (e) {
			console.warn(e)
			return false
		}
	},
	$validarTelefono (codigoPais, telefono) {
		const resultado = phoneValidator(telefono, codigoPais)
		if (this._.isEmpty(resultado)) return false
		else return resultado[0]
	}
}

const mixin = {
	methods
}

function capitalizar (string) {
	if (!string) return null
	const str = String(string)
	return str.substring(0, 1).toUpperCase() + str.substring(1)
}

export default function () {
	Vue.prototype.$p = parameterize
	Vue.prototype.$c = capitalizar

	Vue.mixin(mixin)
}
