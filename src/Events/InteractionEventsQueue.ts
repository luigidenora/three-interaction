/**
 * Syncronize DOM events with the frame generation, discarding ripetitive pointermove event.
 */
export class InteractionEventsQueue {
   private _items: Event[] = [];

   public enqueue(event: Event): void {
      if (event.type === "pointermove") {
         for (let i = this._items.length - 1; i >= 0; i--) {
            const item = this._items[i] as PointerEvent;
            if (item.pointerId === (event as PointerEvent).pointerId) {
               const type = item.type;
               if (type === "pointermove") {
                  this._items[i] = event;
                  // console.log("useless pointermove skipped");
                  return;
               }
               if (/* type === "pointercancel" ||  */type === "pointerdown" || type === "pointerout" || type === "pointerover" || type === "pointerup") break;
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
