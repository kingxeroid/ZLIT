import { createContext,useCallback,useEffect,useMemo,useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./AuthContext";
export const WishlistContext=createContext(null);const STORAGE_KEY="zlit_wishlist";
function readWishlist(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{return [];}}
export function WishlistProvider({children}){
 const {user}=useAuth();const [items,setItems]=useState(readWishlist);
 useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(items));},[items]);
 useEffect(()=>{let active=true;const load=async()=>{if(!user?.id)return;const {data,error}=await supabase.from("wishlist_items").select("product_id,products(id,name,slug,price,compare_at_price,image_url,images)").eq("user_id",user.id);if(!active)return;if(error){console.warn("Wishlist sync:",error.message);return;}if(data?.length)setItems(data.filter(r=>r.products).map(r=>r.products));else if(items.length){for(const item of items){const {error:e}=await supabase.from("wishlist_items").insert({user_id:user.id,product_id:item.id});if(e)console.warn(e.message);}}};load();return()=>{active=false;};},[user?.id]);
 const toggleWishlist=useCallback((product)=>{
  const exists=items.some(i=>String(i.id)===String(product.id));
  if(user?.id){const action=exists?supabase.from("wishlist_items").delete().eq("user_id",user.id).eq("product_id",product.id):supabase.from("wishlist_items").insert({user_id:user.id,product_id:product.id});action.then(({error})=>error&&console.warn("Wishlist save:",error.message));}
  setItems(exists?items.filter(i=>String(i.id)!==String(product.id)):[...items,product]);
 },[items,user?.id]);
 const removeFromWishlist=useCallback((id)=>{setItems(current=>current.filter(i=>String(i.id)!==String(id)));if(user?.id)supabase.from("wishlist_items").delete().eq("user_id",user.id).eq("product_id",id).then(({error})=>error&&console.warn(error.message));},[user?.id]);
 const isWishlisted=useCallback(id=>items.some(i=>String(i.id)===String(id)),[items]);
 const value=useMemo(()=>({items,wishlistIds:items.map(i=>i.id),toggleWishlist,removeFromWishlist,isWishlisted}),[items,toggleWishlist,removeFromWishlist,isWishlisted]);
 return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
