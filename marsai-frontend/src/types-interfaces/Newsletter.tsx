export default interface Newsletter {
    id?: number | string,
    object: string,
    content: string,
    created_at?: string,
    sent_at?: string
}