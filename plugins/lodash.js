import Vue from 'vue'
import _ from 'lodash'


_.isString = function (x) { return typeof x === 'string' }
_.omitDeep = function (collection, excludeKeys) {
	function omitFn (v) {
		if (v && typeof v === 'object') {
			excludeKeys.forEach(k => { delete v[k] })
		}
	}
	return _.cloneDeepWith(collection, omitFn)
}


export default () => {
	Vue.prototype._ = _
}

export {
	_
}
