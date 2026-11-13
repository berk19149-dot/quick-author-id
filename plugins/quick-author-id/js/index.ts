
import { ActionSheetActionCreators, ToastActionCreators } from '@valenced/discord/actions'
import { before } from '@valenced/patcher'

export default plugin({
    start({ cleanup, logger }) {
        let inspected = false

        cleanup(before(ActionSheetActionCreators, 'openLazy', args => {
            if (
                args[1] !== 'MessageLongPressActionSheet' ||
                inspected
            ) {
                return args
            }

            inspected = true

            const lazyModule = args[0] as Promise<any>

            Promise.resolve(lazyModule).then(module => {
                const component = module?.default

                const componentName =
                    component?.displayName ||
                    component?.name ||
                    typeof component

                const exports = module && typeof module === 'object'
                    ? Object.keys(module).join(', ')
                    : 'No module exports'

                const result = `Component: ${componentName} | Exports: ${exports}`

                logger.log(result)

                ToastActionCreators.open('quick-author-id-inspection', {
                    text: result,
                    variant: 'success',
                })
            }).catch(error => {
                logger.error(`Inspection failed: ${String(error)}`)
            })

            return args
        }))

        ToastActionCreators.open('quick-author-id-listener', {
            text: 'Message menu inspector installed',
            variant: 'success',
        })
    },
})
