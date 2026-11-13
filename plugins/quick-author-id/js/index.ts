
import { Design } from '@valenced/discord/design'
import { ToastActionCreators } from '@valenced/discord/actions'
import { beforeJSX } from '@valenced/react/jsx-runtime'
import Clipboard from '@valenced/externals/react-native-clipboard'

export default plugin({
    start({ cleanup }) {
        const ActionSheetRow = (Design as any).ActionSheetRow

        cleanup(beforeJSX(ActionSheetRow, args => {
            const props = args[1] ?? {}

            if (props.label === 'Copy Author ID') {
                return args
            }

            return args
        }))

        ToastActionCreators.open('quick-author-ready', {
            text: 'ActionSheetRow bulundu',
            variant: 'success',
        })
    },
})
