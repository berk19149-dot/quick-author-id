
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
            if (args[1] !== 'MessageLongPressActionSheet') return args

            Promise.resolve(args[0]).then(module => {
                if (!active) return

                const Component = module?.default
                if (!Component) return

                cleanup(beforeJSX(Component, jsxArgs => {
                    if (reported) return jsxArgs
                    reported = true

                    const props = jsxArgs[1] ?? {}

                    const details = Object.entries(props).map(([key, value]) => {
                        const type = typeof value
                        const nested = value && type === 'object'
                            ? Object.keys(value).slice(0, 8).join('/')
                            : ''

                        return nested
                            ? `${key}:${type}(${nested})`
                            : `${key}:${type}`
                    })

                    const chunks: string[] = []
                    let current = ''

                    for (const item of details) {
                        if ((current + item).length > 140) {
                            chunks.push(current)
                            current = ''
                        }
                        current += (current ? ', ' : '') + item
                    }

                    if (current) chunks.push(current)

                    chunks.forEach((chunk, index) => {
                        ToastActionCreators.open(`quick-author-props-${index}`, {
                            text: `Props ${index + 1}/${chunks.length}: ${chunk}`,
                            variant: 'success',
                        })
                    })

                    logger.log(`Props: ${details.join(', ')}`)

                    return jsxArgs
                }))
            }).catch(error => logger.error(String(error)))

            return args
        }))

        ToastActionCreators.open('quick-author-ready', {
            text: 'Props inspector ready',
            variant: 'success',
        })
    },
})
