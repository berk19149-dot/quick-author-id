
import { ActionSheetActionCreators, ToastActionCreators } from '@valenced/discord/actions'
import { before } from '@valenced/patcher'
import { beforeJSX } from '@valenced/react/jsx-runtime'

export default plugin({
    start({ cleanup, logger }) {
        let active = true
        let reported = false

        cleanup(() => {
            active = false
        })

        cleanup(before(ActionSheetActionCreators, 'openLazy', args => {
            if (args[1] !== 'MessageLongPressActionSheet') {
                return args
            }

            Promise.resolve(args[0]).then(module => {
                if (!active) return

                const Component = module?.default

                if (!Component) {
                    logger.error('Message action sheet component not found')
                    return
                }

                cleanup(beforeJSX(Component, jsxArgs => {
                    if (!reported) {
                        reported = true

                        const props = jsxArgs[1] ?? {}
                        const keys = Object.keys(props).join(', ') || 'No props'

                        logger.log(`Message action sheet props: ${keys}`)

                        ToastActionCreators.open('quick-author-id-props', {
                            text: `Props: ${keys}`,
                            variant: 'success',
                        })
                    }

                    return jsxArgs
                }))
            }).catch(error => {
                logger.error(`Component inspection failed: ${String(error)}`)
            })

            return args
        }))

        ToastActionCreators.open('quick-author-id-ready', {
            text: 'Component inspector ready',
            variant: 'success',
        })
    },
})
