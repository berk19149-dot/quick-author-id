
import React from 'react'
import { before } from '@valenced/patcher'
import { beforeJSX } from '@valenced/react/jsx-runtime'
import { Design } from '@valenced/discord/design'
import { ActionSheetActionCreators, ToastActionCreators } from '@valenced/discord/actions'
import { Clipboard } from '@valenced/externals/react-native-clipboard'

export default plugin({
    start({ cleanup }) {
        const ActionSheetRow = (Design as any).ActionSheetRow
        let authorId = ''

        cleanup(before(
            ActionSheetActionCreators,
            'openLazy',
            args => {
                const originalPromise = args[0]

                args[0] = Promise.resolve(originalPromise).then(module => {
                    const Original = module?.default

                    if (typeof Original !== 'function') return module

                    function QuickAuthorSheet(props: any) {
                        authorId = String(props.user?.id ?? '')
                        return React.createElement(Original, props)
                    }

                    return { ...module, default: QuickAuthorSheet }
                })

                return args
            }
        ))

        cleanup(beforeJSX(ActionSheetRow, args => {
            const props = args[1] ?? {}

            if (
                !authorId ||
                !['Yanıtla', 'Reply'].includes(String(props.label)) 
            ) return args

            const id = authorId
            authorId = ''

            const originalRow = React.createElement(
                ActionSheetRow,
                props,
                args[2]
            )

            const copyRow = React.createElement(ActionSheetRow, {
                label: 'Copy Author ID',
                onPress: async () => {
                    await Clipboard.setString(id)
                    ToastActionCreators.open('quick-author-copied', {
                        text: 'Author ID copied!',
                        variant: 'success',
                    })
                },
            })

            return [
                React.Fragment,
                { children: [originalRow, copyRow] },
                args[2],
            ]
        }))
    },
})
