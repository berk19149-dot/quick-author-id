
import { ActionSheetActionCreators, ToastActionCreators } from '@valenced/discord/actions'
import { before } from '@valenced/patcher'

export default plugin({
    start({ cleanup, logger }) {
        let detected = false

        cleanup(before(ActionSheetActionCreators, 'openLazy', args => {
            if (!detected) {
                detected = true

                ToastActionCreators.open('quick-author-id-detected', {
                    text: `Action Sheet detected! Key: ${String(args[1])}`,
                    variant: 'success',
                })

                logger.log(`Action Sheet opened with key: ${String(args[1])}`)
            }

            return args
        }))

        logger.log('Action Sheet listener installed')
    },
})
