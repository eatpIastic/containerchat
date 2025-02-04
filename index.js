/// <reference types="../CTAutocomplete" />

const GuiTextField = Java.type("net.minecraft.client.gui.GuiTextField");
const GuiContainer = Java.type("net.minecraft.client.gui.inventory.GuiContainer");
const GuiChat = Java.type("net.minecraft.client.gui.GuiChat");
const GuiContainerCreative = Java.type("net.minecraft.client.gui.inventory.GuiContainerCreative");
const GuiRepair = Java.type("net.minecraft.client.gui.GuiRepair");
const GuiScreen = Java.type("net.minecraft.client.gui.GuiScreen");
const MathHelper = Java.type("net.minecraft.util.MathHelper");

let historyBuffer = "";
let sentHistoryCursor = -1;
let inputField = undefined; // GuiTextField

const JavaInteger = Java.type("java.lang.Integer");

register("guiOpened", () => {
    let tempInputField = new GuiTextField(JavaInteger.valueOf(0), Renderer.getFontRenderer(), JavaInteger.valueOf(4), JavaInteger.valueOf(Math.floor(Renderer.screen.getHeight() * .5)), JavaInteger.valueOf(4), JavaInteger.valueOf(12));
    tempInputField.func_146203_f(256);
    tempInputField.func_146185_a(false);
    tempInputField.func_146180_a(inputField == undefined ? "" : String(inputField.func_146179_b()));
    tempInputField.func_146195_b(inputField == undefined ? false : inputField.func_146206_l());
    tempInputField.func_146205_d(false);
    inputField = tempInputField;
});

register("postGuiRender", () => {
    if (inputField == undefined) return;
    let text = inputField.func_146179_b();
    Renderer.scale(0.5)
    Renderer.drawStringWithShadow(text, 4, Math.floor(Renderer.screen.getHeight() * .5));
    inputField.func_146194_f();
});

register(net.minecraftforge.client.event.GuiScreenEvent.KeyboardInputEvent.Pre, (event) => {
    if (!(event.gui instanceof GuiContainer)) return;
    if (event.gui instanceof GuiContainerCreative) return;
    if (!Keyboard.getEventKeyState()) return;

    let keyCode = Keyboard.getEventKey();
    if (inputField == undefined) return;
    if (event.gui instanceof GuiRepair) return;

    if (inputField.func_146206_l()) { //isFocused
        if (keyCode == 1) {
            inputField.func_146195_b(false); // .setFocused()
            inputField.func_146180_a(""); // .setText()
            Keyboard.enableRepeatEvents(false);
            Client.getMinecraft().field_71456_v.func_146158_b().func_146240_d(); //resetScroll
        }
        // .gameSettings.keyBindScreenshot.getKeyCode()
        if (keyCode != Client.getMinecraft().field_71474_y.field_151447_Z.func_151463_i()) {
            cancel(event);
        }
    } else {
        // .gameSettings.keyBindChat.getKeyCode()
        if (keyCode == Client.getMinecraft().field_71474_y.field_74310_D.func_151463_i()) {
            // not putting it here but theres 2 lines for controlkeydown. i dont see a point since its not toggleable here.
            inputField.func_146195_b(true); // .setFocused()
            Keyboard.enableRepeatEvents(true);
            return;
        } else if (keyCode == Client.getMinecraft().field_71474_y.field_74323_J.func_151463_i()) {
            inputField.func_146180_a("/");
            inputField.func_146195_b(true);
            Keyboard.enableRepeatEvents(true);
            return;
        }
    }

    if (keyCode != 28 && keyCode != 156) {
        if (keyCode == 200) {
            getSentHistory(-1);
        } else if (keyCode == 208) {
            getSentHistory(1);
        } else {
            // .textboxKeyTyped()
            inputField.func_146201_a(Keyboard.getEventCharacter(), keyCode);
        }
    } else {
        if(!inputField.func_146206_l()) return; // isFocused()
        let text = String(inputField.func_146179_b()).trim(); //getText()

        if (text.length != 0) {
            // sendChatMessage
            event.gui.func_175275_f(text);
        }

        sentHistoryCursor = Array.from(Client.getMinecraft().field_71456_v.func_146158_b().func_146238_c()).length;
        inputField.func_146180_a("");
        inputField.func_146195_b(false);
        Client.getMinecraft().field_71456_v.func_146158_b().func_146240_d();
    }
});

register(net.minecraftforge.client.event.GuiOpenEvent, (event) => {
    sentHistoryCursor = Array.from(Client.getMinecraft().field_71456_v.func_146158_b().func_146238_c()).length;
    if (inputField != undefined) {
        if (!event.gui) {
            if (Client.getMinecraft().field_71462_r instanceof GuiContainer) {
                if (inputField.func_146206_l()) { //.isFocused()
                    event.gui = new GuiChat(inputField.func_146179_b()); //.getText()
                }
            } else {
                inputField = undefined;
            }
        }
    }
});


function getSentHistory(msgPos) {
    let i = sentHistoryCursor + msgPos;
    let j = Array.from(Client.getMinecraft().field_71456_v.func_146158_b().func_146238_c()).length;
    i = MathHelper.func_76125_a(i, 0, j);

    if (i != sentHistoryCursor) {
        if (i == j) {
            sentHistoryCursor = j;
            inputField.func_146180_a(historyBuffer); //setText
        } else {
            if (sentHistoryCursor == j) {
                historyBuffer = inputField.func_146179_b(); //getText
            }
            inputField.func_146180_a(Array.from(Client.getMinecraft().field_71456_v.func_146158_b().func_146238_c())[i]);
            sentHistoryCursor = i;
        }
    }
}