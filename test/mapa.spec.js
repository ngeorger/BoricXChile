import { mount } from '@vue/test-utils'
import mapa from '@/components/mapa.vue'

describe('mapa', () => {
	test('is a Vue instance', () => {
		const wrapper = mount(mapa)
		expect(wrapper.vm).toBeTruthy()
	})
})
