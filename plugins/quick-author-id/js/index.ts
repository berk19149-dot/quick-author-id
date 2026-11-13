
import { lookupModules } from '@valenced/modules/finders'
import { withProps } from '@valenced/modules/finders/filters'
import { ToastActionCreators } from '@valenced/discord/actions'

export default plugin({
    start({ logger }) {
        logger.log('QuickAuthorID module scan started')

        let count = 0

        for (const [module, id] of lookupModules(withProps('openLazy'))) {
            if (count >= 3) break

            const keys = Object.keys(module ?? {}).slice(0, 8).join(', ')

            ToastActionCreators.open(`quick-author-id-scan-${count}`, {
                text: `Module ${id}: ${keys || 'No exports'}`,
                variant: 'success',
            })

            logger.log(`Candidate module ${id}: ${keys}`)
            count++
        }

        ToastActionCreators.open('quick-author-id-scan-result', {
            text: `Scan finished. Found ${count} candidates.`,
            variant: 'success',
        })
    },
})
