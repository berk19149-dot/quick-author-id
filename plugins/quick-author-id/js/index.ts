
import { Design } from '@valenced/discord/design'
import { ToastActionCreators } from '@valenced/discord/actions'
import { beforeJSX } from '@valenced/react/jsx-runtime'

export default plugin({
    start({ cleanup }) {
        const names = Object.keys(Design).filter(name =>
            /ActionSheet|SheetRow/i.test(name)
        )

        const chunks: string[] = []
        let current = ''

        for (const name of names) {
            if ((current + name).length > 100) {
                chunks.push(current)
                current = ''
            }
            current += (current ? ', ' : '') + name
        }

        if (current) chunks.push(current)

        chunks.forEach((chunk, i) => {
            ToastActionCreators.open(`quick-author-design-${i}`, {
                text: `Design exports ${i + 1}/${chunks.length}: ${chunk}`,
                variant: 'success',
            })
        })

        let detected = 0

        for (const name of names) {
            const Component = (Design as any)[name]
            if (!Component) continue

            cleanup(beforeJSX(Component, args => {
                if (detected >= 5) return args

                detected++

                const props = args[1] ?? {}
                const keys = Object.keys(props).join(', ') || 'No props'

                ToastActionCreators.open(
                    `quick-author-row-${detected}`,
                    {
                        text: `${name}: ${keys}`,
                        variant: 'success',
                    }
                )

                return args
            }))
        }
    },
})
