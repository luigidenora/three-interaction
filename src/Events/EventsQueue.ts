export class PointerEventsQueue {
   private _items: PointerEvent[] = [];

   public enqueue(event: PointerEvent): void {
      if (event.type === "pointermove") {
         for (let i = this._items.length - 1; i >= 0; i--) {
            const item = this._items[i];
            if (item.pointerId === event.pointerId) {
               const type = item.type;
               if (type === "pointermove") {
                  this._items[i] = event;
                  // console.log("useless pointermove skipped");
                  return;
               }
               if (type === "pointercancel" || type === "pointerdown" || type === "pointerout" || type === "pointerover" || type === "pointerup") break;
            }
         }
      }
      this._items.push(event);
   }

   public dequeue(): Event[] {
      const items = this._items;
      this._items = [];
      return items;
   }
}
