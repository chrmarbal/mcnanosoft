module.exports = function Cart(cart) {
    this.items = cart.items || {}
    this.totalItems = cart.totalItems || 0
    this.totalPrice = cart.totalPrice || 0

    this.add = (item, id) => {
        let cartItem = this.items[id]
        if(!cartItem){
            cartItem = this.items[id] = {
                item: item,
                price: item.price === "FREE" ? 0 : parseFloat(item.price.replace(/[^\d.,]/g, "").replace(",", "."))
            }
        }

        this.totalItems++
        this.totalPrice += cartItem.item.price == "FREE" ? 0 : parseFloat(cartItem.item.price.replace(/[^\d.,]/g, "").replace(",", "."))
    }

    this.remove = (id) => {
        // console.log(this.items[id])
        this.totalItems --
        this.totalPrice -= this.items[id].price
        this.totalPrice = parseFloat(this.totalPrice.toFixed(2))
        delete this.items[id]
    }

    this.getItems = () => {
        let arr = []
        for (let id in this.items) {
           arr.push(this.items[id])
        }
        return arr
    }

    this.clear = () => {
        this.items = {}
        this.totalItems = 0
        this.totalPrice = 0   
    }
}