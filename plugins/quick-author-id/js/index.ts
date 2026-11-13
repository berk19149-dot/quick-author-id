import { Design } from '@valenced/discord/design'
import { ToastActionCreators } from '@valenced/discord/actions'
import { beforeJSX } from '@valenced/react/jsx-runtime'

export default plugin({
    start({ cleanup }) {
        const ActionSheetRow = (Design as any).ActionSheetRow
        let count = 0

        cleanup(beforeJSX(ActionSheetRow, args => {
            if (count >= 8) return args

            const props = args[1] ?? {}
            count++

            ToastActionCreators.open(`quick-author-row-${count}`, {
                text: `Row ${count}: ${String(props.label)} | onPress: ${typeof props.onPress}`,
                variant: 'success',
            })

            return args
        }))
    },
})
