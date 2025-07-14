'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";

export  const  createCompanion = async (formData: output<ZodObject<Writeable<{
    name: ZodString;
    subject: ZodString;
    topic: ZodString;
    voice: ZodString;
    style: ZodString;
    duration: ZodString
}>, $strip>>) => {
    const { userId: author} = await auth();
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
        .from('companions')
        .insert({...formData, author})
        .select();

    if (error || !data) throw new Error(error ?.message || 'Failed to create companion');
    return data[0];
}