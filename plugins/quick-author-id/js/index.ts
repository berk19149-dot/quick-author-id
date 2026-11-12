
import { Design } from '@valenced/discord/design'
import { ToastActionCreators } from '@valenced/discord/actions'
import { beforeJSX } from '@valenced/react/jsx-runtime'
import { Clipboard } from '@valenced/externals/react-native-clipboard'
import { createElement } from 'react'

const ROW_KEY = 'quick-author-id-copy'

export default plugin({
    start({ cleanup, logger }) {
        const Row = Design.ActionSheetRow

        if (!Row) {
            logger.error('ActionSheetRow component not found')
            return
        }

        const unpatch = beforeJSX(Row, args => {
            const [, props] = args
            const label = props?.label

            if (typeof label !== 'string') return args

            logger.log(`ActionSheetRow detected: ${label}`)
            return args
        })

        cleanup(unpatch)
        logger.log('QuickAuthorID diagnostic patch installed')
    },
})
