/*this is a custom hook for follow button bcoz we can follow user from two places one from
 the right panel and other is when we visit a user profile ,so we are creating a hook
  and using it according to our needs */

import toast from 'react-hot-toast'
import {baseUrl} from '../constant/url'
import {useMutation, useQueryClient} from '@tanstack/react-query'

const useFollow =()=>{
    
    const queryClient = useQueryClient()

    const {mutate:follow,isPending} = useMutation({
        mutationFn:async(userId)=>{ // userId of the user we have to follow  
            try {
               const res = await fetch(`${baseUrl}/api/users/follow/${userId}`,{
                    method : "POST",
					credentials : "include",
					headers : {
						"Content_Type":"application/json"
                    }
               }) 
               const data = await res.json()

				if(!res.ok){
					throw new Error(data.error||"something went wrong")
				}
				return data;
            } catch (error) {
                throw error
            }
        },
        onSuccess : ()=>{
            Promise.all([
                queryClient.invalidateQueries({queryKey:["suggestedUsers"]}),
                queryClient.invalidateQueries({queryKey:["authUser"]})
            ])    
        },
        onError : (error)=>{
            toast.error(error.message)
        }
    })
    return {follow,isPending}
}

export default useFollow;