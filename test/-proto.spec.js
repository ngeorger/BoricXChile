import { mount } from '@vue/test-utils'
import proto from '@/components/-proto.vue'

describe('proto', () => {
	test('is a Vue instance', () => {
		const wrapper = mount(proto)
		expect(wrapper.vm).toBeTruthy()
	})
})
