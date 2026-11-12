
import { getAssetIdByName } from '@valenced/assets'
import {
    ActionSheetActionCreators,
    ToastActionCreators,
} from '@valenced/discord/actions'
import { Design } from '@valenced/discord/design'
import { Clipboard } from '@valenced/externals/react-native-clipboard'
import { after, before } from '@valenced/patcher'
import { findInReactFiber } from '@valenced/utils/react'
import { createElement } from 'react'

const SHEET_KEY = 'MessageLongPressActionSheet'
const ROW_KEY = 'quick-author-id-copy'

const getAuthorId = (m: any): string | undefined => {
    const id = m?.author?.id ?? m?.authorId ?? m?.author_id
    return typeof id === 'string' && id.length ? id : undefined
}

const toast = (text: string, variant: 'success' | 'critical') =>
    ToastActionCreators.open('quick-author-id-toast', { text, variant })

const findGroups = (tree: any): any[] | undefined =>
    findInReactFiber(
        tree,
        (n: any) =>
            n?.[0]?.type?.name === 'ActionSheetRowGroup' ||
            n?.[0]?.props?.children?.[0]?.props?.label,
    ) ??
    findInReactFiber(tree, (n: any) => n?.type?.name === 'Stack' || n?.props?.spacing)
        ?.props?.children

const hasRow = (groups: any[]) =>
    groups.some(
        g =>
            g?.key === ROW_KEY ||
            (Array.isArray(g?.props?.children) &&
                g.props.children.some((c: any) => c?.key === ROW_KEY)),
    )

export default plugin({
    start({ cleanup, logger }) {
        const Row: any = Design.ActionSheetRow
        const iconId = getAssetIdByName('CopyIcon')

        const makeRow = (message: any) =>
            createElement(Row, {
                key: ROW_KEY,
                label: 'Copy Author ID',
                icon:
                    Row.Icon && iconId != null
                        ? createElement(Row.Icon, { source: iconId })
                        : undefined,
                onPress: async () => {
                    const id = getAuthorId(message)
                    if (!id) return toast("Could not find the author's ID", 'critical')
                    try {
                        await Clipboard.setString(id)
                        toast('Copied Author ID to clipboard', 'success')
                        ActionSheetActionCreators.hideActionSheet(SHEET_KEY)
                    } catch (e) {
                        logger.error('copy failed', e)
                        toast("Could not find the author's ID", 'critical')
                    }
                },
            })

        const inject = (tree: any, message: any) => {
            try {
                const groups = findGroups(tree)
                if (!groups || hasRow(groups)) return
                const first = groups[0]
                if (Array.isArray(first?.props?.children)) {
                    first.props.children.unshift(makeRow(message))
                } else if (first?.type) {
                    groups.unshift(createElement(first.type, { key: `${ROW_KEY}-group` }, makeRow(message)))
                }
            } catch (e) {
                logger.error('inject failed', e)
            }
        }

        cleanup(
            before(ActionSheetActionCreators, 'openLazy', args => {
                const [sheet, key, props] = args as any[]
                const message = props?.message
                if (key !== SHEET_KEY || !message || typeof sheet?.then !== 'function')
                    return args

                sheet.then((mod: any) => {
                    let done = false
                    const finish = (un: () => void) => () => {
                        if (!done) { done = true; un() }
                    }
                    if (mod.default && typeof mod.default === 'object') {
                        const un: () => void = after(mod.default, 'type', (_a: any, ret: any) => {
                            inject(ret, message)
                            un()
                            return ret
                        })
                        cleanup(finish(un))
                    } else {
                        const un: () => void = after(mod, 'default', (_a: any, ret: any) => {
                            un()
                            if (typeof ret?.type === 'function') {
                                const un2: () => void = after(ret, 'type', (_b: any, tree: any) => {
                                    inject(tree, message)
                                    return tree
                                })
                                cleanup(finish(un2))
                            } else inject(ret, message)
                            return ret
                        })
                        cleanup(finish(un))
                    }
                }).catch((e: unknown) => logger.error('sheet patch failed', e))

                return args
            }),
        )
    },
})
