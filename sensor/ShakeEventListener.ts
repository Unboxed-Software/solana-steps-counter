import {Accelerometer} from 'expo-sensors'
import {Subscription} from 'expo-modules-core'

export default class ShakeEventListener {
	static hasAnyListeners() {
		return Accelerometer.hasListeners()
	}
	static addListener(threshold: number, callback: () => void) {
		let lastX: number, lastY: number, lastZ: number
		let lastUpdate = 0

		Accelerometer.addListener((data) => {
			let {x, y, z} = data
			let currentTime = Date.now()
			if (currentTime - lastUpdate > 100) {
				let diffTime = currentTime - lastUpdate
				lastUpdate = currentTime

				let shakeSpeed =
					(Math.abs(x + y - lastX - lastY) / diffTime) * 10000

				let downSpeed = (Math.abs(y - lastY) / diffTime) * 1000

				if (shakeSpeed > threshold || downSpeed > threshold) {
					callback()
				}
				lastX = x
				lastY = y
				lastZ = z
			}
		})
	}

	static removeListener(subscription?: Subscription) {
		if (subscription) {
			Accelerometer.removeSubscription(subscription)
		} else {
			Accelerometer.removeAllListeners()
		}
	}
}
