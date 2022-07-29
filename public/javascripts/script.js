let icon=document.querySelectorAll('.shareIcons');
let sign=document.querySelectorAll('.shareTag');

icon.forEach(hit);

function hit(item){
    item.onmouseover=function(){
        sign.forEach(spin);
        function spin(item){
            item.classList.add('spun');
            }  
        }
    item.onmouseout=function(){
        sign.forEach(spin);
        function spin(item){
            item.classList.remove('spun');
            }  
        }
    }