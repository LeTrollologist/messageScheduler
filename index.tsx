import definePlugin, { OptionType, IconComponent } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { ChatBarButton } from "@api/ChatButtons";
import { Devs } from "@utils/constants";
import {
    ModalRoot,
    ModalHeader,
    ModalContent,
    ModalFooter,
    openModal,
    ModalSize,
} from "@utils/modal";
import {
    Button,
    Text,
    MessageActions,
    React,
    Toasts,
    Menu,
    SelectedChannelStore,
} from "@webpack/common";

import "./styles.css";

interface ScheduledMessage {
    id: string;
    channelId: string;
    content: string;
    sendAt: number;
}

const settings = definePluginSettings({
    sendToast: {
        type: OptionType.BOOLEAN,
        description: "Show a toast when a message is sent",
        default: true,
    }
}).withPrivateSettings<{ scheduledMessages: ScheduledMessage[] }>();

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

const CalendarIcon: IconComponent = (props) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
    </svg>
);



function startScheduler() {
    if (schedulerInterval) return;
    schedulerInterval = setInterval(() => {
        const now = Date.now();
        const messages = settings.store.scheduledMessages;
        if (!messages || messages.length === 0) return;

        const due = messages.filter(m => m.sendAt <= now);
        if (due.length === 0) return;

        settings.store.scheduledMessages = messages.filter(m => m.sendAt > now);

        for (const msg of due) {
            MessageActions.sendMessage(msg.channelId, {
                content: msg.content,
                invalidEmojis: [],
                validNonShortcutEmojis: [],
                tts: false,
            }, {}, {}).then(() => {
                if (settings.store.sendToast) {
                    Toasts.show({
                        message: "Scheduled message sent!",
                        id: Toasts.genId(),
                        type: Toasts.Type.SUCCESS
                    });
                }
            }).catch(err => {
                console.error("[MessageScheduler] Failed to send message:", err);
                Toasts.show({
                    message: "Failed to send scheduled message",
                    id: Toasts.genId(),
                    type: Toasts.Type.FAILURE
                });
            });
        }
    }, 1000);
}

function stopScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
}

function ScheduleModal({ channelId, message, onClose }: { channelId: string; message: string; onClose: () => void; }) {
    const [dateInput, setDateInput] = React.useState("");
    const [textValue, setTextValue] = React.useState(message);

    const onSchedule = () => {
        const sendAt = new Date(dateInput).getTime();
        if (!sendAt || isNaN(sendAt) || sendAt < Date.now()) {
            Toasts.show({ message: "Please select a future date and time", id: Toasts.genId(), type: Toasts.Type.FAILURE });
            return;
        }
        if (!textValue.trim()) {
            Toasts.show({ message: "Message content cannot be empty", id: Toasts.genId(), type: Toasts.Type.FAILURE });
            return;
        }

        const currentMessages = [...(settings.store.scheduledMessages || [])];
        currentMessages.push({
            id: Math.random().toString(36).substring(7),
            channelId,
            content: textValue,
            sendAt
        });
        settings.store.scheduledMessages = currentMessages;

        Toasts.show({ message: "Message scheduled successfully!", id: Toasts.genId(), type: Toasts.Type.SUCCESS });
        onClose();
    };

    return (
        <ModalRoot transitionState={1} size={ModalSize.SMALL} className="vc-scheduler-modal">
            <ModalHeader separator={false}>
                <Text variant="heading-lg/bold" color="header-primary">Schedule Message</Text>
            </ModalHeader>
            <ModalContent style={{ padding: "20px" }}>
                <div style={{ marginBottom: "20px" }}>
                    <Text variant="text-sm/bold" color="header-secondary" style={{ textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Send At</Text>
                    <input type="datetime-local" className="vc-scheduler-input" value={dateInput} onChange={e => setDateInput(e.target.value)} />
                </div>
                <div>
                    <Text variant="text-sm/bold" color="header-secondary" style={{ textTransform: "uppercase", marginBottom: "8px", display: "block" }}>Message Content</Text>
                    <textarea className="vc-scheduler-textarea" placeholder="What do you want to say later?" value={textValue} onChange={e => setTextValue(e.target.value)} />
                </div>
            </ModalContent>
            <ModalFooter>
                <Button onClick={onSchedule} color={Button.Colors.BRAND}>Schedule Message</Button>
                <Button onClick={onClose} look={Button.Looks.LINK} color={Button.Colors.PRIMARY}>Cancel</Button>
            </ModalFooter>
        </ModalRoot>
    );
}

export default definePlugin({
    name: "MessageScheduler",
    description: "Allows you to schedule messages to be sent at a specific time.",
    authors: [{ name: "trollologist", id: 196282233152208899n }],
    settings,

    start() {
        if (!settings.store.scheduledMessages) settings.store.scheduledMessages = [];
        startScheduler();
    },

    stop() {
        stopScheduler();
    },

    chatBarButton: {
        icon: CalendarIcon,
        render: () => (
            <ChatBarButton
                tooltip="Schedule Message"
                onClick={() => {
                    const channelId = SelectedChannelStore.getChannelId();
                    openModal(modalProps => (
                        <ScheduleModal
                            channelId={channelId}
                            message=""
                            onClose={modalProps.onClose}
                        />
                    ));
                }}
            >
                <CalendarIcon width={20} height={20} />
            </ChatBarButton>
        )
    },

    contextMenus: {
        "message-input": (children, props: any) => {
            children.push(
                <Menu.MenuGroup>
                    <Menu.MenuItem
                        id="schedule-message"
                        label="Schedule Message"
                        action={() => {
                            openModal(modalProps => (
                                <ScheduleModal
                                    channelId={props.channel.id}
                                    message={props.textValue || ""}
                                    onClose={modalProps.onClose}
                                />
                            ));
                        }}
                    />
                </Menu.MenuGroup>
            );
        },
        "textarea-context": (children, props: any) => {
            // Some versions of Discord use this ID
            children.push(
                <Menu.MenuGroup>
                    <Menu.MenuItem
                        id="schedule-message-textarea"
                        label="Schedule Message"
                        action={() => {
                            const channelId = SelectedChannelStore.getChannelId();
                            openModal(modalProps => (
                                <ScheduleModal
                                    channelId={channelId}
                                    message=""
                                    onClose={modalProps.onClose}
                                />
                            ));
                        }}
                    />
                </Menu.MenuGroup>
            );
        }
    }
});