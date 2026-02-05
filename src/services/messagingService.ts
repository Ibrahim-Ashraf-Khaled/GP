import { supabase } from '@/lib/supabase';
import { Message } from '@/types/messaging';

export const messagingService = {
    // ====== Media Upload ======
    async uploadMedia(file: File, type: 'image' | 'voice', conversationId: string): Promise<string> {
        const bucket = type === 'image' ? 'chat-images' : 'voice-notes';
        const fileExt = file.name.split('.').pop() || (type === 'voice' ? 'webm' : 'jpg');
        const filename = `${conversationId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filename, file, {
                contentType: type === 'voice' ? 'audio/webm' : file.type
            });

        if (uploadError) {
            console.error(`Error uploading ${type}:`, uploadError);
            if (uploadError.message.includes('size')) {
                throw new Error('الملف كبير جداً، الحد الأقصى 5 ميجا');
            } else if (uploadError.message.includes('type')) {
                throw new Error('نوع الملف غير مدعوم');
            } else {
                throw new Error(`فشل رفع ${type === 'image' ? 'الصورة' : 'التسجيل الصوتي'}: ${uploadError.message}`);
            }
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        return publicUrl;
    },

    // ====== Media Permissions ======
    async requestMediaPermission(conversationId: string, userId: string): Promise<void> {
        // 1. Get user name first
        const { data: user } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

        // 2. Update status
        const { error } = await supabase
            .from('conversations')
            .update({ media_permission_status: 'pending' })
            .eq('id', conversationId);

        if (error) throw error;

        // 3. Send system message
        const { error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: userId,
                text: null,
                message_type: 'system',
                metadata: {
                    type: 'media_permission_request',
                    requester_id: userId,
                    requester_name: user?.full_name || 'مستخدم'
                }
            });

        if (msgError) throw msgError;
    },

    async grantMediaPermission(conversationId: string): Promise<void> {
        const { error } = await supabase
            .from('conversations')
            .update({ media_permission_status: 'granted' })
            .eq('id', conversationId);

        if (error) throw error;
    },

    async denyMediaPermission(conversationId: string): Promise<void> {
        const { error } = await supabase
            .from('conversations')
            .update({ media_permission_status: 'denied' })
            .eq('id', conversationId);

        if (error) throw error;
    },

    // ====== Typing Indicator ======
    async sendTypingIndicator(conversationId: string, isTyping: boolean, userId: string, userName: string) {
        const channel = supabase.channel(`typing-${conversationId}`);

        // Subscribe first if not already
        if (channel.state !== 'joined') {
            await channel.subscribe();
        }

        await channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
                isTyping,
                userId,
                userName,
                timestamp: new Date().toISOString()
            }
        });
    },

    subscribeToTypingIndicator(conversationId: string, callback: (isTyping: boolean) => void) {
        const channel = supabase.channel(`typing-${conversationId}`)
            .on(
                'broadcast',
                { event: 'typing' },
                (payload) => callback(payload.payload.isTyping)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};
