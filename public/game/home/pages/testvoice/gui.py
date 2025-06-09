# a_tkinter_gui.py

import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox, simpledialog
import openai
import os
import json
import threading
import queue
from PIL import Image, ImageTk  # Optional: for image display
from pathlib import Path

# --- Constants ---
DEFAULT_MODEL_CHAT = "gpt-4o"
DEFAULT_MODEL_EMBEDDING = "text-embedding-3-small"
DEFAULT_MODEL_TTS = "tts-1"
DEFAULT_MODEL_STT = "whisper-1" # Or gpt-4o-transcribe
DEFAULT_MODEL_MODERATION = "text-moderation-latest" # or omni-moderation-latest
DEFAULT_MODEL_IMAGE = "dall-e-3"

# --- Main Application Class ---
class OpenAIDemoApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("OpenAI API Explorer")
        self.geometry("900x700")

        # API Key Management
        self.api_key = tk.StringVar(value=os.environ.get("OPENAI_API_KEY", ""))
        self.org_id = tk.StringVar(value=os.environ.get("OPENAI_ORGANIZATION", ""))
        self.project_id = tk.StringVar(value=os.environ.get("OPENAI_PROJECT", ""))
        self.client = None
        self.message_queue = queue.Queue()
        self.controls_to_disable = []  # Initialize empty list for controls to disable

        self._create_widgets()
        self._update_client() # Initial client setup
        self.after(100, self._process_queue) # Start queue polling

    def _process_queue(self):
        """ Process messages from the background thread queue. """
        try:
            while True:
                message_type, data = self.message_queue.get_nowait()
                if message_type == "output":
                    self._update_output(data + "\n")
                elif message_type == "status":
                    self._update_status(data)
                elif message_type == "clear_output":
                    self._clear_output()
                elif message_type == "enable_controls":
                    self._toggle_controls(True)
                elif message_type == "disable_controls":
                     self._toggle_controls(False)
                elif message_type == "populate_models":
                     self._populate_models_combobox_actual(data)
                elif message_type == "populate_voices":
                     self._populate_voices_combobox_actual(data)
                elif message_type == "populate_assistants":
                     self._populate_assistants_combobox_actual(data)
                elif message_type == "populate_threads":
                     self._populate_threads_combobox_actual(data)
                elif message_type == "display_image":
                     self._display_image_actual(data) # data is image_data (bytes) or url
                elif message_type == "save_file_dialog":
                    self._save_file_dialog_actual(*data) # data is (content, default_ext)
                elif message_type == "error":
                    messagebox.showerror("API Error", data)
                self.update_idletasks() # Process updates immediately
        except queue.Empty:
            pass # No messages left
        finally:
            # Reschedule after 100ms
            self.after(100, self._process_queue)

    def _put_in_queue(self, message_type, data=None):
        """ Safely put messages into the queue from any thread. """
        self.message_queue.put((message_type, data))

    def _update_client(self, event=None):
        """Updates the OpenAI client instance."""
        key = self.api_key.get()
        org = self.org_id.get() or None
        proj = self.project_id.get() or None
        if key:
            try:
                self.client = openai.OpenAI(
                    api_key=key,
                    organization=org,
                    project=proj
                    )
                self._update_status("OpenAI client initialized.")
                self._populate_models_combobox() # Try populating models on client update
            except Exception as e:
                self.client = None
                messagebox.showerror("Client Error", f"Failed to initialize OpenAI client:\n{e}")
                self._update_status("Client initialization failed.")
        else:
            self.client = None
            self._update_status("API Key needed to initialize client.")

    def _create_widgets(self):
        # Top frame for API Key/Org/Project
        top_frame = ttk.Frame(self, padding="5")
        top_frame.pack(side=tk.TOP, fill=tk.X)

        ttk.Label(top_frame, text="API Key:").pack(side=tk.LEFT, padx=(0, 2))
        key_entry = ttk.Entry(top_frame, textvariable=self.api_key, width=40, show="*")
        key_entry.pack(side=tk.LEFT, padx=(0, 10))
        key_entry.bind("<FocusOut>", self._update_client)
        key_entry.bind("<Return>", self._update_client)

        ttk.Label(top_frame, text="Org ID (Opt):").pack(side=tk.LEFT, padx=(0, 2))
        org_entry = ttk.Entry(top_frame, textvariable=self.org_id, width=25)
        org_entry.pack(side=tk.LEFT, padx=(0, 10))
        org_entry.bind("<FocusOut>", self._update_client)
        org_entry.bind("<Return>", self._update_client)


        ttk.Label(top_frame, text="Project ID (Opt):").pack(side=tk.LEFT, padx=(0, 2))
        proj_entry = ttk.Entry(top_frame, textvariable=self.project_id, width=25)
        proj_entry.pack(side=tk.LEFT, padx=(0, 10))
        proj_entry.bind("<FocusOut>", self._update_client)
        proj_entry.bind("<Return>", self._update_client)


        # Notebook for different features
        self.notebook = ttk.Notebook(self, padding="5")
        self.notebook.pack(expand=True, fill=tk.BOTH, side=tk.TOP)

        # Output Text Area (Shared)
        output_frame = ttk.Frame(self, padding="5")
        output_frame.pack(expand=True, fill=tk.BOTH, side=tk.BOTTOM)
        ttk.Label(output_frame, text="Output / Log:").pack(anchor=tk.W)
        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD, height=15, state=tk.DISABLED)
        self.output_text.pack(expand=True, fill=tk.BOTH, pady=(5, 0))

        # Status Bar
        self.status_label = ttk.Label(self, text="Status: Ready", relief=tk.SUNKEN, anchor=tk.W, padding="2")
        self.status_label.pack(side=tk.BOTTOM, fill=tk.X)

        # Create Tabs
        self._create_responses_tab()
        self._create_chat_completions_tab()
        self._create_images_tab()
        self._create_audio_tab()
        self._create_embeddings_tab()
        self._create_files_tab()
        self._create_moderation_tab()
        self._create_models_tab()
        self._create_assistants_tab()

        # Store all control widgets that should be disabled during API calls
        self.controls_to_disable = []
        for tab_id in self.notebook.tabs():
            tab_widget = self.notebook.nametowidget(self.notebook.select())
            for widget in tab_widget.winfo_children():
                 if isinstance(widget, (ttk.Button, ttk.Entry, ttk.Combobox, ttk.Checkbutton, ttk.Scale, scrolledtext.ScrolledText)):
                     # Exclude output text area if needed, but disabling input areas is primary goal
                     if widget != self.output_text:
                           self.controls_to_disable.append(widget)


    def _toggle_controls(self, enabled):
        """Enable or disable UI controls."""
        state = tk.NORMAL if enabled else tk.DISABLED
        for widget in self.controls_to_disable:
            # Check if widget exists before configuring
            if widget.winfo_exists():
                try:
                    # ScrolledText uses 'state', others might too
                    if hasattr(widget, 'configure'):
                       widget.configure(state=state)
                except tk.TclError:
                    # Handle cases where state configuration isn't applicable or widget destroyed
                    pass
        # Special handling for ScrolledText widgets used as input
        if hasattr(self, 'resp_input_text') and self.resp_input_text.winfo_exists():
            self.resp_input_text.config(state=state)
        if hasattr(self, 'chat_messages_text') and self.chat_messages_text.winfo_exists():
             self.chat_messages_text.config(state=state)
        if hasattr(self, 'tts_input_text') and self.tts_input_text.winfo_exists():
            self.tts_input_text.config(state=state)
        if hasattr(self, 'embed_input_text') and self.embed_input_text.winfo_exists():
             self.embed_input_text.config(state=state)
        if hasattr(self, 'mod_input_text') and self.mod_input_text.winfo_exists():
             self.mod_input_text.config(state=state)
        if hasattr(self, 'asst_thread_message_text') and self.asst_thread_message_text.winfo_exists():
            self.asst_thread_message_text.config(state=state)
            
        # Ensure output text is always scrollable but not editable by user
        if self.output_text.winfo_exists():
             self.output_text.config(state=tk.NORMAL) # Temporarily enable to allow programmatic changes
             # If you want it purely read-only for user actions:
             # self.output_text.bind("<KeyPress>", lambda e: "break")

    def _run_in_thread(self, target_func, *args):
        """Runs a function in a separate thread to avoid blocking the GUI."""
        if not self.client:
             messagebox.showerror("Error", "OpenAI client not initialized. Please provide a valid API Key.")
             return
        
        self._put_in_queue("disable_controls")
        self._put_in_queue("status", "Processing...")
        self._put_in_queue("clear_output")

        thread = threading.Thread(target=target_func, args=args, daemon=True)
        thread.start()

    def _update_status(self, message):
        self.status_label.config(text=f"Status: {message}")

    def _update_output(self, text):
        self.output_text.config(state=tk.NORMAL)
        self.output_text.insert(tk.END, text)
        self.output_text.see(tk.END) # Scroll to the end
        self.output_text.config(state=tk.DISABLED)

    def _clear_output(self):
         self.output_text.config(state=tk.NORMAL)
         self.output_text.delete('1.0', tk.END)
         self.output_text.config(state=tk.DISABLED)

    # --- Tab Creation Methods ---

    def _create_responses_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Responses API")

        # Input Area
        ttk.Label(tab, text="Input (Text):").grid(row=0, column=0, sticky=tk.W, pady=(0, 5))
        self.resp_input_text = scrolledtext.ScrolledText(tab, wrap=tk.WORD, height=8, width=80)
        self.resp_input_text.grid(row=1, column=0, columnspan=4, sticky="ew", pady=(0, 10))
        self.resp_input_text.insert(tk.END, "Tell me a short story about a futuristic city.")

        # Controls Frame
        controls_frame = ttk.Frame(tab)
        controls_frame.grid(row=2, column=0, columnspan=4, sticky="ew")

        ttk.Label(controls_frame, text="Model:").pack(side=tk.LEFT, padx=(0, 5))
        self.resp_model_combo = ttk.Combobox(controls_frame, values=[DEFAULT_MODEL_CHAT], width=25)
        self.resp_model_combo.pack(side=tk.LEFT, padx=(0, 15))
        self.resp_model_combo.set(DEFAULT_MODEL_CHAT)

        ttk.Label(controls_frame, text="Max Tokens:").pack(side=tk.LEFT, padx=(0, 5))
        self.resp_max_tokens_var = tk.StringVar(value="150")
        ttk.Entry(controls_frame, textvariable=self.resp_max_tokens_var, width=6).pack(side=tk.LEFT, padx=(0, 15))

        ttk.Label(controls_frame, text="Temp:").pack(side=tk.LEFT, padx=(0, 5))
        self.resp_temp_var = tk.DoubleVar(value=0.7)
        ttk.Scale(controls_frame, from_=0.0, to=2.0, variable=self.resp_temp_var, orient=tk.HORIZONTAL, length=100).pack(side=tk.LEFT, padx=(0, 15))


        self.resp_stream_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(controls_frame, text="Stream", variable=self.resp_stream_var).pack(side=tk.LEFT, padx=(10, 5))

        # Action Button
        run_button = ttk.Button(controls_frame, text="Generate Response", command=self._generate_response)
        run_button.pack(side=tk.LEFT, padx=(10, 0))

        # Add widgets to be disabled
        self.controls_to_disable.extend([
            self.resp_input_text, self.resp_model_combo,
            controls_frame.winfo_children()[-4], # Max Tokens Entry
            controls_frame.winfo_children()[-2], # Temp Scale
            controls_frame.winfo_children()[-1], # Stream Checkbutton
            run_button
        ])


    def _create_chat_completions_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Chat Completions API")

        ttk.Label(tab, text="Messages (JSON format):").grid(row=0, column=0, sticky=tk.W, pady=(0, 5))
        self.chat_messages_text = scrolledtext.ScrolledText(tab, wrap=tk.WORD, height=10, width=80)
        self.chat_messages_text.grid(row=1, column=0, columnspan=4, sticky="ew", pady=(0, 10))
        default_messages = json.dumps([
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Who won the world series in 2020?"}
        ], indent=2)
        self.chat_messages_text.insert(tk.END, default_messages)

        # Controls Frame
        controls_frame = ttk.Frame(tab)
        controls_frame.grid(row=2, column=0, columnspan=4, sticky="ew")

        ttk.Label(controls_frame, text="Model:").pack(side=tk.LEFT, padx=(0, 5))
        self.chat_model_combo = ttk.Combobox(controls_frame, values=[DEFAULT_MODEL_CHAT], width=25)
        self.chat_model_combo.pack(side=tk.LEFT, padx=(0, 15))
        self.chat_model_combo.set(DEFAULT_MODEL_CHAT)

        ttk.Label(controls_frame, text="Max Tokens:").pack(side=tk.LEFT, padx=(0, 5))
        self.chat_max_tokens_var = tk.StringVar(value="150")
        ttk.Entry(controls_frame, textvariable=self.chat_max_tokens_var, width=6).pack(side=tk.LEFT, padx=(0, 15))

        ttk.Label(controls_frame, text="Temp:").pack(side=tk.LEFT, padx=(0, 5))
        self.chat_temp_var = tk.DoubleVar(value=0.7)
        ttk.Scale(controls_frame, from_=0.0, to=2.0, variable=self.chat_temp_var, orient=tk.HORIZONTAL, length=100).pack(side=tk.LEFT, padx=(0, 15))

        self.chat_stream_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(controls_frame, text="Stream", variable=self.chat_stream_var).pack(side=tk.LEFT, padx=(10, 5))

        # Action Button
        run_button = ttk.Button(controls_frame, text="Generate Chat Completion", command=self._generate_chat_completion)
        run_button.pack(side=tk.LEFT, padx=(10, 0))

        # Add widgets to be disabled
        self.controls_to_disable.extend([
             self.chat_messages_text, self.chat_model_combo,
             controls_frame.winfo_children()[-4], # Max Tokens Entry
             controls_frame.winfo_children()[-2], # Temp Scale
             controls_frame.winfo_children()[-1], # Stream Checkbutton
             run_button
        ])

    def _create_images_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Images API")

        ttk.Label(tab, text="Prompt:").grid(row=0, column=0, sticky=tk.W, pady=(0,5))
        self.img_prompt_var = tk.StringVar(value="A cute baby sea otter")
        self.img_prompt_entry = ttk.Entry(tab, textvariable=self.img_prompt_var, width=80)
        self.img_prompt_entry.grid(row=1, column=0, columnspan=4, sticky="ew", pady=(0, 10))

        controls_frame = ttk.Frame(tab)
        controls_frame.grid(row=2, column=0, columnspan=4, sticky="ew")

        ttk.Label(controls_frame, text="Model:").pack(side=tk.LEFT, padx=(0, 5))
        self.img_model_combo = ttk.Combobox(controls_frame, values=["dall-e-2", "dall-e-3"], width=15)
        self.img_model_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.img_model_combo.set(DEFAULT_MODEL_IMAGE)
        self.img_model_combo.bind("<<ComboboxSelected>>", self._update_image_options)

        ttk.Label(controls_frame, text="N:").pack(side=tk.LEFT, padx=(0, 5))
        self.img_n_var = tk.StringVar(value="1")
        self.img_n_entry = ttk.Entry(controls_frame, textvariable=self.img_n_var, width=3)
        self.img_n_entry.pack(side=tk.LEFT, padx=(0, 10))

        ttk.Label(controls_frame, text="Size:").pack(side=tk.LEFT, padx=(0, 5))
        self.img_size_combo = ttk.Combobox(controls_frame, values=["1024x1024", "1792x1024", "1024x1792"], width=10) # DALL-E 3 default
        self.img_size_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.img_size_combo.set("1024x1024")

        # DALL-E 3 specific options
        self.img_quality_label = ttk.Label(controls_frame, text="Quality:")
        self.img_quality_combo = ttk.Combobox(controls_frame, values=["standard", "hd"], width=8)
        self.img_quality_combo.set("standard")

        self.img_style_label = ttk.Label(controls_frame, text="Style:")
        self.img_style_combo = ttk.Combobox(controls_frame, values=["vivid", "natural"], width=8)
        self.img_style_combo.set("vivid")

        # Initially pack DALL-E 3 options
        self.img_quality_label.pack(side=tk.LEFT, padx=(5, 5))
        self.img_quality_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.img_style_label.pack(side=tk.LEFT, padx=(5, 5))
        self.img_style_combo.pack(side=tk.LEFT, padx=(0, 10))

        self.img_resp_fmt_var = tk.StringVar(value="url")
        ttk.Checkbutton(controls_frame, text="Return b64_json", variable=self.img_resp_fmt_var, onvalue="b64_json", offvalue="url").pack(side=tk.LEFT, padx=(10, 5))

        run_button = ttk.Button(controls_frame, text="Generate Image", command=self._generate_image)
        run_button.pack(side=tk.LEFT, padx=(10, 0))

        # --- Image Display Area (Optional) ---
        self.img_display_label = ttk.Label(tab, text="Generated Image:")
        self.img_display_label.grid(row=3, column=0, columnspan=4, sticky=tk.W, pady=(10, 0))
        # Placeholder for image - Use a Label
        self.img_canvas = tk.Label(tab, borderwidth=1, relief="solid", text="Image will appear here")
        self.img_canvas.grid(row=4, column=0, columnspan=4, pady=5, padx=5, sticky='nsew')
        tab.grid_rowconfigure(4, weight=1) # Allow image area to expand
        tab.grid_columnconfigure(0, weight=1)

        self._update_image_options() # Set initial state based on default model

        # Add widgets to be disabled
        self.controls_to_disable.extend([
             self.img_prompt_entry, self.img_model_combo, self.img_n_entry,
             self.img_size_combo, self.img_quality_combo, self.img_style_combo,
             controls_frame.winfo_children()[-2], # resp format checkbutton
             run_button
        ])

    def _update_image_options(self, event=None):
        """Show/hide DALL-E 3 specific options."""
        model = self.img_model_combo.get()
        dalle3_options = [self.img_quality_label, self.img_quality_combo, self.img_style_label, self.img_style_combo]

        if model == "dall-e-3":
            self.img_size_combo['values'] = ["1024x1024", "1792x1024", "1024x1792"]
            # Make sure N is 1 for DALL-E 3
            if self.img_n_var.get() != "1":
                self.img_n_var.set("1")
            self.img_n_entry.config(state=tk.DISABLED)
            # Show DALL-E 3 options
            for widget in dalle3_options:
                widget.pack(side=tk.LEFT, padx=(5, 5))

        elif model == "dall-e-2":
            self.img_size_combo['values'] = ["256x256", "512x512", "1024x1024"]
            self.img_n_entry.config(state=tk.NORMAL)
            # Hide DALL-E 3 options
            for widget in dalle3_options:
                widget.pack_forget()
        else: # Should not happen with combobox, but good practice
             self.img_n_entry.config(state=tk.NORMAL)
             for widget in dalle3_options:
                widget.pack_forget()

        # Ensure size is valid for the selected model
        current_size = self.img_size_combo.get()
        if current_size not in self.img_size_combo['values']:
            self.img_size_combo.set(self.img_size_combo['values'][0])


    def _create_audio_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Audio API")

        # --- Text-to-Speech (TTS) ---
        tts_frame = ttk.LabelFrame(tab, text="Text-to-Speech (TTS)", padding="10")
        tts_frame.pack(fill=tk.X, pady=(0, 10))

        ttk.Label(tts_frame, text="Text Input:").grid(row=0, column=0, sticky=tk.W, pady=(0, 5))
        self.tts_input_text = scrolledtext.ScrolledText(tts_frame, wrap=tk.WORD, height=4, width=70)
        self.tts_input_text.grid(row=1, column=0, columnspan=4, sticky="ew", pady=(0, 10))
        self.tts_input_text.insert(tk.END, "Hello! This is a test of the OpenAI Text-to-Speech API.")

        controls_frame = ttk.Frame(tts_frame)
        controls_frame.grid(row=2, column=0, columnspan=4, sticky="ew")

        ttk.Label(controls_frame, text="Model:").pack(side=tk.LEFT, padx=(0, 5))
        self.tts_model_combo = ttk.Combobox(controls_frame, values=["tts-1", "tts-1-hd"], width=10)
        self.tts_model_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.tts_model_combo.set(DEFAULT_MODEL_TTS)

        ttk.Label(controls_frame, text="Voice:").pack(side=tk.LEFT, padx=(0, 5))
        # Voices need to be populated dynamically if possible, or hardcoded based on docs
        self.tts_voices = ["alloy", "ash", "ballad", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer", "verse"]
        self.tts_voice_combo = ttk.Combobox(controls_frame, values=self.tts_voices, width=10)
        self.tts_voice_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.tts_voice_combo.set("alloy")

        ttk.Label(controls_frame, text="Speed:").pack(side=tk.LEFT, padx=(0, 5))
        self.tts_speed_var = tk.DoubleVar(value=1.0)
        ttk.Scale(controls_frame, from_=0.25, to=4.0, variable=self.tts_speed_var, orient=tk.HORIZONTAL, length=80).pack(side=tk.LEFT, padx=(0, 10))

        ttk.Button(controls_frame, text="Generate & Save Speech", command=self._generate_speech).pack(side=tk.LEFT, padx=(10, 0))

        # --- Speech-to-Text (STT / Transcribe) ---
        stt_frame = ttk.LabelFrame(tab, text="Speech-to-Text (Transcribe)", padding="10")
        stt_frame.pack(fill=tk.X)

        stt_controls = ttk.Frame(stt_frame)
        stt_controls.pack(fill=tk.X, pady=5)

        self.stt_file_path_var = tk.StringVar()
        ttk.Label(stt_controls, text="Audio File:").pack(side=tk.LEFT, padx=(0, 5))
        ttk.Entry(stt_controls, textvariable=self.stt_file_path_var, width=40, state=tk.READABLE).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(stt_controls, text="Browse...", command=self._browse_stt_file).pack(side=tk.LEFT, padx=(0, 15))

        ttk.Label(stt_controls, text="Model:").pack(side=tk.LEFT, padx=(0, 5))
        # Add gpt-4o-transcribe etc. based on docs
        self.stt_model_combo = ttk.Combobox(stt_controls, values=["whisper-1"], width=15)
        self.stt_model_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.stt_model_combo.set(DEFAULT_MODEL_STT)

        run_stt_button = ttk.Button(stt_controls, text="Transcribe Audio", command=self._transcribe_audio)
        run_stt_button.pack(side=tk.LEFT, padx=(10, 0))

        # Add widgets to be disabled
        self.controls_to_disable.extend([
             self.tts_input_text, self.tts_model_combo, self.tts_voice_combo,
             controls_frame.winfo_children()[-2], # Speed Scale
             controls_frame.winfo_children()[-1], # Generate Button
             stt_controls.winfo_children()[1], # File Path Entry
             stt_controls.winfo_children()[2], # Browse Button
             self.stt_model_combo, run_stt_button
        ])

    def _create_embeddings_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Embeddings API")

        ttk.Label(tab, text="Input Text:").grid(row=0, column=0, sticky=tk.W, pady=(0, 5))
        self.embed_input_text = scrolledtext.ScrolledText(tab, wrap=tk.WORD, height=5, width=80)
        self.embed_input_text.grid(row=1, column=0, columnspan=3, sticky="ew", pady=(0, 10))
        self.embed_input_text.insert(tk.END, "The quick brown fox jumps over the lazy dog.")

        controls_frame = ttk.Frame(tab)
        controls_frame.grid(row=2, column=0, columnspan=3, sticky="ew")

        ttk.Label(controls_frame, text="Model:").pack(side=tk.LEFT, padx=(0, 5))
        self.embed_model_combo = ttk.Combobox(controls_frame, values=["text-embedding-ada-002", "text-embedding-3-small", "text-embedding-3-large"], width=25)
        self.embed_model_combo.pack(side=tk.LEFT, padx=(0, 15))
        self.embed_model_combo.set(DEFAULT_MODEL_EMBEDDING)

        # Dimensions (only for v3 models)
        ttk.Label(controls_frame, text="Dimensions (Opt):").pack(side=tk.LEFT, padx=(0, 5))
        self.embed_dims_var = tk.StringVar(value="")
        self.embed_dims_entry = ttk.Entry(controls_frame, textvariable=self.embed_dims_var, width=6)
        self.embed_dims_entry.pack(side=tk.LEFT, padx=(0, 15))

        run_button = ttk.Button(controls_frame, text="Create Embeddings", command=self._create_embeddings)
        run_button.pack(side=tk.LEFT, padx=(10, 0))

        # Add widgets to be disabled
        self.controls_to_disable.extend([
            self.embed_input_text, self.embed_model_combo,
            self.embed_dims_entry, run_button
        ])

    def _create_files_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Files API")

        # --- Upload File ---
        upload_frame = ttk.LabelFrame(tab, text="Upload File", padding="10")
        upload_frame.pack(fill=tk.X, pady=(0, 10))

        uf_controls = ttk.Frame(upload_frame)
        uf_controls.pack(fill=tk.X, pady=5)

        self.upload_file_path_var = tk.StringVar()
        ttk.Label(uf_controls, text="File:").pack(side=tk.LEFT, padx=(0, 5))
        ttk.Entry(uf_controls, textvariable=self.upload_file_path_var, width=40, state=tk.READABLE).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(uf_controls, text="Browse...", command=self._browse_upload_file).pack(side=tk.LEFT, padx=(0, 15))

        ttk.Label(uf_controls, text="Purpose:").pack(side=tk.LEFT, padx=(0, 5))
        # Common purposes based on docs
        purposes = ["fine-tune", "assistants", "batch", "vision", "user_data", "evals"]
        self.upload_purpose_combo = ttk.Combobox(uf_controls, values=purposes, width=15)
        self.upload_purpose_combo.pack(side=tk.LEFT, padx=(0, 10))
        self.upload_purpose_combo.set("assistants")

        upload_button = ttk.Button(uf_controls, text="Upload", command=self._upload_file)
        upload_button.pack(side=tk.LEFT, padx=(10, 0))


        # --- List & Delete Files ---
        manage_frame = ttk.LabelFrame(tab, text="Manage Files", padding="10")
        manage_frame.pack(fill=tk.X, pady=(0, 10))

        mf_controls = ttk.Frame(manage_frame)
        mf_controls.pack(fill=tk.X, pady=5)

        list_button = ttk.Button(mf_controls, text="List Files", command=self._list_files)
        list_button.pack(side=tk.LEFT, padx=(0, 20))

        ttk.Label(mf_controls, text="File ID to Retrieve/Delete:").pack(side=tk.LEFT, padx=(0, 5))
        self.manage_file_id_var = tk.StringVar()
        manage_file_entry = ttk.Entry(mf_controls, textvariable=self.manage_file_id_var, width=30)
        manage_file_entry.pack(side=tk.LEFT, padx=(0, 10))

        retrieve_button = ttk.Button(mf_controls, text="Retrieve Info", command=self._retrieve_file)
        retrieve_button.pack(side=tk.LEFT, padx=(0, 5))
        # Retrieve content might be large, maybe add later if needed
        # ttk.Button(mf_controls, text="Retrieve Content", command=self._retrieve_file_content).pack(side=tk.LEFT, padx=(0,5))
        delete_button = ttk.Button(mf_controls, text="Delete File", command=self._delete_file)
        delete_button.pack(side=tk.LEFT, padx=(0, 5))

        # Add widgets to be disabled
        self.controls_to_disable.extend([
             uf_controls.winfo_children()[1], # File path entry
             uf_controls.winfo_children()[2], # Browse button
             self.upload_purpose_combo, upload_button,
             list_button, manage_file_entry, retrieve_button, delete_button
        ])


    def _create_moderation_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Moderations API")

        ttk.Label(tab, text="Input Text:").grid(row=0, column=0, sticky=tk.W, pady=(0, 5))
        self.mod_input_text = scrolledtext.ScrolledText(tab, wrap=tk.WORD, height=5, width=80)
        self.mod_input_text.grid(row=1, column=0, columnspan=3, sticky="ew", pady=(0, 10))
        self.mod_input_text.insert(tk.END, "I want to kill them.") # Example from docs

        controls_frame = ttk.Frame(tab)
        controls_frame.grid(row=2, column=0, columnspan=3, sticky="ew")

        ttk.Label(controls_frame, text="Model:").pack(side=tk.LEFT, padx=(0, 5))
        self.mod_model_combo = ttk.Combobox(controls_frame, values=["text-moderation-latest", "text-moderation-stable", "omni-moderation-latest"], width=25)
        self.mod_model_combo.pack(side=tk.LEFT, padx=(0, 15))
        self.mod_model_combo.set(DEFAULT_MODEL_MODERATION)

        run_button = ttk.Button(controls_frame, text="Check Moderation", command=self._create_moderation)
        run_button.pack(side=tk.LEFT, padx=(10, 0))

         # Add widgets to be disabled
        self.controls_to_disable.extend([
            self.mod_input_text, self.mod_model_combo, run_button
        ])

    def _create_models_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Models API")

        controls_frame = ttk.Frame(tab)
        controls_frame.pack(fill=tk.X, pady=5)

        list_button = ttk.Button(controls_frame, text="List Available Models", command=self._list_models)
        list_button.pack(side=tk.LEFT, padx=(0, 20))

        ttk.Label(controls_frame, text="Model ID to Retrieve:").pack(side=tk.LEFT, padx=(0, 5))
        self.retrieve_model_id_var = tk.StringVar(value=DEFAULT_MODEL_CHAT)
        model_entry = ttk.Entry(controls_frame, textvariable=self.retrieve_model_id_var, width=30)
        model_entry.pack(side=tk.LEFT, padx=(0, 10))

        retrieve_button = ttk.Button(controls_frame, text="Retrieve Model Info", command=self._retrieve_model)
        retrieve_button.pack(side=tk.LEFT, padx=(0, 5))

        # Add widgets to be disabled
        self.controls_to_disable.extend([
            list_button, model_entry, retrieve_button
        ])

    def _create_assistants_tab(self):
        tab = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(tab, text="Assistants API")

        # Sub-notebook for Assistants, Threads, Runs
        asst_notebook = ttk.Notebook(tab)
        asst_notebook.pack(expand=True, fill=tk.BOTH, pady=5)

        # --- Assistants Management ---
        asst_manage_tab = ttk.Frame(asst_notebook, padding="10")
        asst_notebook.add(asst_manage_tab, text="Assistants")

        am_controls = ttk.Frame(asst_manage_tab)
        am_controls.pack(fill=tk.X, pady=5)
        ttk.Button(am_controls, text="List Assistants", command=self._list_assistants).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Label(am_controls, text="Selected Assistant ID:").pack(side=tk.LEFT, padx=(10, 5))
        self.asst_selected_id_var = tk.StringVar()
        self.asst_id_combo = ttk.Combobox(am_controls, textvariable=self.asst_selected_id_var, width=30, state="readonly")
        self.asst_id_combo.pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(am_controls, text="Retrieve", command=self._retrieve_assistant).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(am_controls, text="Delete", command=self._delete_assistant).pack(side=tk.LEFT, padx=(0, 5))


        create_frame = ttk.LabelFrame(asst_manage_tab, text="Create New Assistant", padding="10")
        create_frame.pack(fill=tk.X, pady=10)

        ttk.Label(create_frame, text="Name:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        self.asst_create_name_var = tk.StringVar(value="Demo Assistant")
        ttk.Entry(create_frame, textvariable=self.asst_create_name_var, width=30).grid(row=0, column=1, padx=5, pady=5, sticky=tk.EW)

        ttk.Label(create_frame, text="Model:").grid(row=0, column=2, padx=5, pady=5, sticky=tk.W)
        self.asst_create_model_combo = ttk.Combobox(create_frame, values=[DEFAULT_MODEL_CHAT], width=20)
        self.asst_create_model_combo.grid(row=0, column=3, padx=5, pady=5, sticky=tk.EW)
        self.asst_create_model_combo.set(DEFAULT_MODEL_CHAT)

        ttk.Label(create_frame, text="Instructions:").grid(row=1, column=0, padx=5, pady=5, sticky=tk.NW)
        self.asst_create_instructions_text = scrolledtext.ScrolledText(create_frame, wrap=tk.WORD, height=3, width=60)
        self.asst_create_instructions_text.grid(row=1, column=1, columnspan=3, padx=5, pady=5, sticky=tk.EW)
        self.asst_create_instructions_text.insert(tk.END, "You are a helpful demo assistant.")

        ttk.Label(create_frame, text="Tools:").grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
        tool_frame = ttk.Frame(create_frame)
        tool_frame.grid(row=2, column=1, columnspan=3, padx=5, pady=5, sticky=tk.W)
        self.asst_tool_code_var = tk.BooleanVar()
        self.asst_tool_search_var = tk.BooleanVar()
        ttk.Checkbutton(tool_frame, text="Code Interpreter", variable=self.asst_tool_code_var).pack(side=tk.LEFT)
        ttk.Checkbutton(tool_frame, text="File Search", variable=self.asst_tool_search_var).pack(side=tk.LEFT, padx=(10, 0))
        # Function tool is more complex to define here, omitted for simplicity

        ttk.Button(create_frame, text="Create Assistant", command=self._create_assistant).grid(row=3, column=1, columnspan=2, pady=10)


        # --- Threads Management ---
        thread_manage_tab = ttk.Frame(asst_notebook, padding="10")
        asst_notebook.add(thread_manage_tab, text="Threads & Messages")

        tm_controls = ttk.Frame(thread_manage_tab)
        tm_controls.pack(fill=tk.X, pady=5)
        ttk.Button(tm_controls, text="Create New Thread", command=self._create_thread).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Label(tm_controls, text="Selected Thread ID:").pack(side=tk.LEFT, padx=(10, 5))
        self.asst_selected_thread_id_var = tk.StringVar()
        self.asst_thread_id_combo = ttk.Combobox(tm_controls, textvariable=self.asst_selected_thread_id_var, width=30, state="readonly")
        self.asst_thread_id_combo.pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(tm_controls, text="Retrieve", command=self._retrieve_thread).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(tm_controls, text="List Messages", command=self._list_messages).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(tm_controls, text="Delete Thread", command=self._delete_thread).pack(side=tk.LEFT, padx=(0, 5))

        msg_frame = ttk.LabelFrame(thread_manage_tab, text="Add Message to Selected Thread", padding="10")
        msg_frame.pack(fill=tk.X, pady=10)
        ttk.Label(msg_frame, text="Message Content:").pack(anchor=tk.W)
        self.asst_thread_message_text = scrolledtext.ScrolledText(msg_frame, wrap=tk.WORD, height=3, width=60)
        self.asst_thread_message_text.pack(fill=tk.X, pady=5)
        ttk.Button(msg_frame, text="Add Message", command=self._create_message).pack(pady=5)


        # --- Runs Management ---
        run_manage_tab = ttk.Frame(asst_notebook, padding="10")
        asst_notebook.add(run_manage_tab, text="Runs")

        rm_controls = ttk.Frame(run_manage_tab)
        rm_controls.pack(fill=tk.X, pady=5)
        ttk.Label(rm_controls, text="Assistant ID:").pack(side=tk.LEFT, padx=(0, 5))
        self.asst_run_asst_id_entry = ttk.Entry(rm_controls, textvariable=self.asst_selected_id_var, width=25) # Use selected assistant by default
        self.asst_run_asst_id_entry.pack(side=tk.LEFT, padx=(0, 10))

        ttk.Label(rm_controls, text="Thread ID:").pack(side=tk.LEFT, padx=(0, 5))
        self.asst_run_thread_id_entry = ttk.Entry(rm_controls, textvariable=self.asst_selected_thread_id_var, width=25) # Use selected thread by default
        self.asst_run_thread_id_entry.pack(side=tk.LEFT, padx=(0, 10))

        self.asst_run_stream_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(rm_controls, text="Stream Run", variable=self.asst_run_stream_var).pack(side=tk.LEFT, padx=(10, 5))

        ttk.Button(rm_controls, text="Create Run", command=self._create_run).pack(side=tk.LEFT, padx=(10, 0))

        rm_controls2 = ttk.Frame(run_manage_tab)
        rm_controls2.pack(fill=tk.X, pady=5)
        ttk.Label(rm_controls2, text="Run ID:").pack(side=tk.LEFT, padx=(0, 5))
        self.asst_selected_run_id_var = tk.StringVar()
        ttk.Entry(rm_controls2, textvariable=self.asst_selected_run_id_var, width=30).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(rm_controls2, text="Retrieve Run", command=self._retrieve_run).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(rm_controls2, text="List Run Steps", command=self._list_run_steps).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(rm_controls2, text="Cancel Run", command=self._cancel_run).pack(side=tk.LEFT, padx=(0, 5))

        # Add widgets to be disabled (Selectively, as some are needed to identify targets)
        self.controls_to_disable.extend([
            # Assistant Manage
            am_controls.winfo_children()[0], # List Assist
            am_controls.winfo_children()[3], # Retrieve Assist
            am_controls.winfo_children()[4], # Delete Assist
            self.asst_create_name_var, self.asst_create_model_combo, self.asst_create_instructions_text,
            tool_frame.winfo_children()[0], tool_frame.winfo_children()[1], # Tool checks
            create_frame.winfo_children()[-1], # Create Assist Button
            # Thread Manage
            tm_controls.winfo_children()[0], # Create Thread
            tm_controls.winfo_children()[3], # Retrieve Thread
            tm_controls.winfo_children()[4], # List Messages
            tm_controls.winfo_children()[5], # Delete Thread
            self.asst_thread_message_text,
            msg_frame.winfo_children()[-1], # Add Message Button
             # Run Manage
            self.asst_run_asst_id_entry, self.asst_run_thread_id_entry,
            rm_controls.winfo_children()[-2], # Stream Check
            rm_controls.winfo_children()[-1], # Create Run Button
            rm_controls2.winfo_children()[1], # Run ID Entry
            rm_controls2.winfo_children()[2], # Retrieve Run
            rm_controls2.winfo_children()[3], # List Steps
            rm_controls2.winfo_children()[4], # Cancel Run
        ])


    # --- Populate Comboboxes ---
    def _populate_models_combobox(self):
        # Don't run if client isn't ready
        if not self.client:
            return
        # Run in background thread
        thread = threading.Thread(target=self._populate_models_thread, daemon=True)
        thread.start()

    def _populate_models_thread(self):
        """Fetches models in background."""
        try:
            models = self.client.models.list()
            model_ids = sorted([m.id for m in models.data if "gpt" in m.id or "dall-e" in m.id or "tts" in m.id or "whisper" in m.id or "text-embedding" in m.id or "moderation" in m.id]) # Basic filtering
            self._put_in_queue("populate_models", model_ids)
        except Exception as e:
            print(f"Error fetching models: {e}") # Log to console, don't block UI thread with messagebox
            # Optionally put an error status in the queue

    def _populate_models_combobox_actual(self, model_ids):
        """Updates comboboxes in the main thread."""
        chat_models = [m for m in model_ids if "gpt" in m and "instruct" not in m]
        # Add more specific filtering if needed for other types
        image_models = [m for m in model_ids if "dall-e" in m]
        tts_models = [m for m in model_ids if "tts" in m]
        stt_models = [m for m in model_ids if "whisper" in m or "transcribe" in m]
        embed_models = [m for m in model_ids if "embedding" in m]
        mod_models = [m for m in model_ids if "moderation" in m]


        if chat_models:
            if hasattr(self, 'resp_model_combo'): self.resp_model_combo['values'] = chat_models
            if hasattr(self, 'chat_model_combo'): self.chat_model_combo['values'] = chat_models
            if hasattr(self, 'asst_create_model_combo'): self.asst_create_model_combo['values'] = chat_models

        if image_models:
            if hasattr(self, 'img_model_combo'): self.img_model_combo['values'] = image_models
        if tts_models:
             if hasattr(self, 'tts_model_combo'): self.tts_model_combo['values'] = tts_models
        if stt_models:
             if hasattr(self, 'stt_model_combo'): self.stt_model_combo['values'] = stt_models
        if embed_models:
            if hasattr(self, 'embed_model_combo'): self.embed_model_combo['values'] = embed_models
        if mod_models:
            if hasattr(self, 'mod_model_combo'): self.mod_model_combo['values'] = mod_models

        # Try to keep selection if possible, otherwise set default
        for combo in [getattr(self, 'resp_model_combo', None), getattr(self, 'chat_model_combo', None), getattr(self, 'asst_create_model_combo', None)]:
            if combo and combo.get() not in combo['values']:
                combo.set(DEFAULT_MODEL_CHAT if chat_models else (combo['values'][0] if combo['values'] else ''))

        # Similar logic for other combos and their defaults...
        if hasattr(self, 'img_model_combo') and self.img_model_combo.get() not in self.img_model_combo['values']:
            self.img_model_combo.set(DEFAULT_MODEL_IMAGE if image_models else (self.img_model_combo['values'][0] if self.img_model_combo['values'] else ''))
        # ... and so on for TTS, STT, Embed, Mod models ...


    def _populate_voices_combobox_actual(self, voice_ids):
        # Currently hardcoded, but could be fetched if API provides it
         if hasattr(self, 'tts_voice_combo'):
             self.tts_voice_combo['values'] = voice_ids
             if self.tts_voice_combo.get() not in voice_ids:
                 self.tts_voice_combo.set(voice_ids[0] if voice_ids else "")

    def _populate_assistants_combobox_actual(self, assistant_data):
        """ assistant_data is a list of (name, id) tuples """
        if hasattr(self, 'asst_id_combo'):
            self.asst_id_combo['values'] = [f"{name} ({id})" for name, id in assistant_data]
            # Optionally set the first one as default or keep selection
            # self.asst_id_combo.set(self.asst_id_combo['values'][0] if assistant_data else "")
            self.asst_selected_id_var.set(assistant_data[0][1] if assistant_data else "") # Store raw ID

    def _populate_threads_combobox_actual(self, thread_ids):
        """ thread_ids is a list of thread IDs """
        if hasattr(self, 'asst_thread_id_combo'):
             self.asst_thread_id_combo['values'] = thread_ids
             # self.asst_thread_id_combo.set(thread_ids[0] if thread_ids else "")
             self.asst_selected_thread_id_var.set(thread_ids[0] if thread_ids else "") # Store raw ID

    # --- Image Display & File Handling ---

    def _display_image_actual(self, image_source):
        """ Displays image from URL or b64 data. Needs Pillow. """
        try:
            from io import BytesIO
            import base64
            import requests

            if not image_source:
                self.img_canvas.config(image='', text="No image source.")
                return

            image_data = None
            if isinstance(image_source, str) and image_source.startswith('http'):
                response = requests.get(image_source, stream=True)
                response.raise_for_status()
                image_data = response.content
            elif isinstance(image_source, str): # Assuming b64 string
                 image_data = base64.b64decode(image_source)
            elif isinstance(image_source, bytes): # Direct bytes
                image_data = image_source
            else:
                 self.img_canvas.config(image='', text="Invalid image source.")
                 return

            if image_data:
                img = Image.open(BytesIO(image_data))
                # Resize to fit the label/canvas area if needed
                max_size = (300, 300) # Example max size
                img.thumbnail(max_size, Image.Resampling.LANCZOS)

                photo = ImageTk.PhotoImage(img)
                self.img_canvas.config(image=photo, text="")
                self.img_canvas.image = photo # Keep a reference!
            else:
                 self.img_canvas.config(image='', text="Failed to load image.")

        except ImportError:
            self._put_in_queue("output", "[Image display requires Pillow: pip install Pillow]")
            self.img_canvas.config(image='', text="Pillow not installed.")
        except Exception as e:
            self._put_in_queue("output", f"[Error displaying image: {e}]")
            self.img_canvas.config(image='', text=f"Error: {e}")

    def _browse_stt_file(self):
        filename = filedialog.askopenfilename(
            title="Select Audio File",
            filetypes=(("Audio Files", "*.flac *.mp3 *.mp4 *.mpeg *.mpga *.m4a *.ogg *.wav *.webm"), ("All files", "*.*"))
        )
        if filename:
            self.stt_file_path_var.set(filename)

    def _browse_upload_file(self):
         filename = filedialog.askopenfilename(title="Select File to Upload")
         if filename:
            self.upload_file_path_var.set(filename)

    def _save_file_dialog_actual(self, content_bytes, default_extension, title="Save As"):
         """Shows save dialog and writes bytes to the chosen file."""
         filename = filedialog.asksaveasfilename(
             title=title,
             defaultextension=default_extension,
             filetypes=[(f"{default_extension.upper()} files", f"*{default_extension}"), ("All files", "*.*")]
         )
         if filename:
             try:
                 with open(filename, "wb") as f:
                     f.write(content_bytes)
                 self._put_in_queue("status", f"File saved successfully to {filename}")
                 self._put_in_queue("output", f"Saved to: {filename}")
             except Exception as e:
                  self._put_in_queue("error", f"Failed to save file: {e}")
                  self._put_in_queue("status", "Error saving file.")
         else:
              self._put_in_queue("status", "Save cancelled.")
         # Re-enable controls after dialog interaction finishes
         self._put_in_queue("enable_controls")


    # --- API Call Handlers (To be run in threads) ---

    def _generate_response(self):
        self._run_in_thread(self._generate_response_thread)

    def _generate_response_thread(self):
        try:
            prompt = self.resp_input_text.get("1.0", tk.END).strip()
            model = self.resp_model_combo.get()
            max_tokens_str = self.resp_max_tokens_var.get()
            stream = self.resp_stream_var.get()
            temperature = self.resp_temp_var.get()

            if not prompt:
                self._put_in_queue("error", "Input cannot be empty.")
                self._put_in_queue("enable_controls")
                return

            max_tokens = None
            try:
                if max_tokens_str:
                    max_tokens = int(max_tokens_str)
            except ValueError:
                 self._put_in_queue("error", "Max Tokens must be an integer.")
                 self._put_in_queue("enable_controls")
                 return

            self._put_in_queue("output", f"--- Generating Response (Model: {model}, Stream: {stream}) ---")

            if stream:
                response_stream = self.client.responses.create(
                    model=model,
                    input=prompt,
                    max_output_tokens=max_tokens,
                    temperature=temperature,
                    stream=True,
                )
                full_response_text = ""
                for event in response_stream:
                    if event.type == 'response.output_text.delta':
                        delta = event.delta
                        full_response_text += delta
                        self._put_in_queue("output", delta) # Update GUI incrementally
                    # Handle other stream events if needed (e.g., tool calls)
                    elif event.type == 'response.completed':
                         self._put_in_queue("output", f"\n--- Stream Complete ---")
                         # Optionally display final usage info if available in the event
                         # if event.response and event.response.usage:
                         #    self._put_in_queue("output", f"\nUsage: {event.response.usage}")

                self._put_in_queue("status", "Response generation complete (streamed).")

            else: # Not streaming
                response = self.client.responses.create(
                    model=model,
                    input=prompt,
                    max_output_tokens=max_tokens,
                    temperature=temperature,
                    stream=False,
                )
                # Using the convenience property if available (check SDK version/docs)
                output_text = getattr(response, 'output_text', None)
                if output_text:
                     self._put_in_queue("output", output_text)
                else:
                    # Fallback: manually extract from output array if needed
                    text_content = ""
                    if response.output:
                       for item in response.output:
                           if item.type == 'message' and item.content:
                              for part in item.content:
                                   if part.type == 'output_text':
                                      text_content += part.text
                    self._put_in_queue("output", text_content if text_content else "[No text output found]")


                self._put_in_queue("output", f"\n\n--- Full Response Object ---")
                self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
                self._put_in_queue("status", "Response generation complete.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             # Signal that controls can be re-enabled
             self._put_in_queue("enable_controls")


    def _generate_chat_completion(self):
        self._run_in_thread(self._generate_chat_completion_thread)

    def _generate_chat_completion_thread(self):
        try:
            messages_str = self.chat_messages_text.get("1.0", tk.END).strip()
            model = self.chat_model_combo.get()
            max_tokens_str = self.chat_max_tokens_var.get()
            stream = self.chat_stream_var.get()
            temperature = self.chat_temp_var.get()

            try:
                messages = json.loads(messages_str)
                if not isinstance(messages, list):
                    raise ValueError("Input must be a JSON list of messages.")
            except json.JSONDecodeError:
                self._put_in_queue("error", "Invalid JSON format for messages.")
                self._put_in_queue("enable_controls")
                return
            except ValueError as e:
                 self._put_in_queue("error", str(e))
                 self._put_in_queue("enable_controls")
                 return

            max_tokens = None
            try:
                if max_tokens_str:
                    # Use max_completion_tokens for newer models if specified, else max_tokens
                    max_tokens = int(max_tokens_str)
            except ValueError:
                 self._put_in_queue("error", "Max Tokens must be an integer.")
                 self._put_in_queue("enable_controls")
                 return

            self._put_in_queue("output", f"--- Generating Chat Completion (Model: {model}, Stream: {stream}) ---")

            if stream:
                response_stream = self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=max_tokens, # Use max_tokens for older API compatibility if needed
                    # max_completion_tokens=max_tokens, # Preferred for newer models
                    temperature=temperature,
                    stream=True,
                )
                full_response_text = ""
                for chunk in response_stream:
                    content = chunk.choices[0].delta.content
                    if content is not None:
                        full_response_text += content
                        self._put_in_queue("output", content)
                    if chunk.choices[0].finish_reason:
                         self._put_in_queue("output", f"\n--- Stream Complete (Finish Reason: {chunk.choices[0].finish_reason}) ---")

                self._put_in_queue("status", "Chat completion complete (streamed).")

            else: # Not streaming
                completion = self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=max_tokens, # Or max_completion_tokens
                    temperature=temperature,
                    stream=False,
                )
                self._put_in_queue("output", completion.choices[0].message.content)
                self._put_in_queue("output", f"\n\n--- Full Completion Object ---")
                self._put_in_queue("output", json.dumps(completion.to_dict(), indent=2))
                self._put_in_queue("status", "Chat completion complete.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")


    def _generate_image(self):
        self._run_in_thread(self._generate_image_thread)

    def _generate_image_thread(self):
        try:
            prompt = self.img_prompt_var.get().strip()
            model = self.img_model_combo.get()
            n_str = self.img_n_var.get()
            size = self.img_size_combo.get()
            quality = self.img_quality_combo.get() if model == "dall-e-3" else None
            style = self.img_style_combo.get() if model == "dall-e-3" else None
            response_format = self.img_resp_fmt_var.get() # "url" or "b64_json"

            if not prompt:
                self._put_in_queue("error", "Prompt cannot be empty.")
                self._put_in_queue("enable_controls")
                return

            try:
                n = int(n_str)
                if model == "dall-e-3" and n != 1:
                     n = 1
                     self._put_in_queue("output", "[Note: DALL-E 3 only supports n=1]")
                elif n < 1 or n > 10:
                     raise ValueError("N must be between 1 and 10.")
            except ValueError:
                 self._put_in_queue("error", "N must be an integer between 1 and 10.")
                 self._put_in_queue("enable_controls")
                 return


            self._put_in_queue("output", f"--- Generating Image (Model: {model}, Size: {size}) ---")

            response = self.client.images.generate(
                model=model,
                prompt=prompt,
                n=n,
                size=size,
                quality=quality,
                style=style,
                response_format=response_format
            )

            self._put_in_queue("output", f"\n--- Response ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))

            # Display the first image
            if response.data:
                first_image_data = response.data[0]
                image_source = getattr(first_image_data, response_format, None) # Get 'url' or 'b64_json' attribute
                if image_source:
                    self._put_in_queue("display_image", image_source)
                else:
                    self._put_in_queue("output", "[Could not find image data in response]")
            else:
                self._put_in_queue("output", "[No image data returned]")


            self._put_in_queue("status", "Image generation complete.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    def _generate_speech(self):
        self._run_in_thread(self._generate_speech_thread)

    def _generate_speech_thread(self):
        try:
            text = self.tts_input_text.get("1.0", tk.END).strip()
            model = self.tts_model_combo.get()
            voice = self.tts_voice_combo.get()
            speed = self.tts_speed_var.get()
            # Default to mp3, could add a combobox for format
            response_format = "mp3"

            if not text:
                 self._put_in_queue("error", "TTS input text cannot be empty.")
                 self._put_in_queue("enable_controls")
                 return

            self._put_in_queue("output", f"--- Generating Speech (Model: {model}, Voice: {voice}) ---")

            # Use streaming response to get bytes directly
            response = self.client.audio.speech.with_streaming_response.create(
                model=model,
                voice=voice,
                input=text,
                response_format=response_format,
                speed=speed,
            )

            # Read all bytes from the streaming response
            audio_content = response.read()

            self._put_in_queue("output", f"Generated {len(audio_content)} bytes of audio data.")
            # Ask user where to save using the main thread's dialog
            self._put_in_queue("save_file_dialog", (audio_content, f".{response_format}", "Save Speech As"))
            # Note: Controls will be re-enabled *after* the save dialog is handled in _save_file_dialog_actual

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
            self._put_in_queue("enable_controls") # Enable controls on error
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
            self._put_in_queue("enable_controls") # Enable controls on error
        # No finally here, enable_controls is called by _save_file_dialog_actual

    def _transcribe_audio(self):
        file_path = self.stt_file_path_var.get()
        if not file_path or not os.path.exists(file_path):
            messagebox.showerror("Error", "Please select a valid audio file.")
            return
        self._run_in_thread(self._transcribe_audio_thread, file_path)

    def _transcribe_audio_thread(self, file_path):
        try:
            model = self.stt_model_combo.get()
            # Could add inputs for language, prompt, response_format etc. here
            self._put_in_queue("output", f"--- Transcribing Audio (Model: {model}) ---")
            self._put_in_queue("output", f"File: {file_path}")


            with open(file_path, "rb") as audio_file:
                 # Note: Transcription doesn't support streaming for whisper-1
                 # Check docs if gpt-4o-transcribe supports it via this endpoint
                 transcript = self.client.audio.transcriptions.create(
                     model=model,
                     file=audio_file
                     # Add language, prompt, response_format if needed
                 )

            self._put_in_queue("output", f"\n--- Transcription Result ---")
            # Assuming default 'json' format which returns an object with 'text'
            if hasattr(transcript, 'text'):
                self._put_in_queue("output", transcript.text)
            else:
                 # Handle other response formats (verbose_json, text, srt, vtt) if implemented
                 self._put_in_queue("output", json.dumps(transcript.to_dict(), indent=2))


            self._put_in_queue("status", "Audio transcription complete.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except FileNotFoundError:
             self._put_in_queue("error", f"Audio file not found: {file_path}")
             self._put_in_queue("status", "File Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    def _create_embeddings(self):
        self._run_in_thread(self._create_embeddings_thread)

    def _create_embeddings_thread(self):
        try:
            input_text = self.embed_input_text.get("1.0", tk.END).strip()
            model = self.embed_model_combo.get()
            dimensions_str = self.embed_dims_var.get()

            if not input_text:
                self._put_in_queue("error", "Input text cannot be empty.")
                self._put_in_queue("enable_controls")
                return

            dimensions = None
            if dimensions_str:
                try:
                    dimensions = int(dimensions_str)
                    if dimensions <= 0: raise ValueError("Dimensions must be positive.")
                    # Check if model supports dimensions (text-embedding-3)
                    if "ada" in model:
                        dimensions = None # Ignore for ada
                        self._put_in_queue("output", "[Note: Dimensions ignored for ada models]")
                except ValueError:
                     self._put_in_queue("error", "Dimensions must be a positive integer.")
                     self._put_in_queue("enable_controls")
                     return

            self._put_in_queue("output", f"--- Creating Embeddings (Model: {model}) ---")

            response = self.client.embeddings.create(
                model=model,
                input=input_text,
                dimensions=dimensions, # Pass None if not applicable/set
                encoding_format="float" # or base64
            )

            self._put_in_queue("output", f"\n--- Embedding Result ---")
            # Output only the first embedding vector for brevity in the GUI
            if response.data and len(response.data) > 0:
                 embedding_vector = response.data[0].embedding
                 self._put_in_queue("output", f"Vector length: {len(embedding_vector)}")
                 self._put_in_queue("output", f"First few values: {embedding_vector[:5]}...")
            else:
                 self._put_in_queue("output", "[No embedding data returned]")

            self._put_in_queue("output", f"\n\n--- Full Response Object ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            self._put_in_queue("status", "Embeddings creation complete.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")


    def _upload_file(self):
        file_path = self.upload_file_path_var.get()
        purpose = self.upload_purpose_combo.get()
        if not file_path or not os.path.exists(file_path):
            messagebox.showerror("Error", "Please select a valid file to upload.")
            return
        if not purpose:
            messagebox.showerror("Error", "Please select a purpose for the file.")
            return
        self._run_in_thread(self._upload_file_thread, file_path, purpose)

    def _upload_file_thread(self, file_path, purpose):
        try:
            self._put_in_queue("output", f"--- Uploading File ---")
            self._put_in_queue("output", f"File: {file_path}")
            self._put_in_queue("output", f"Purpose: {purpose}")

            with open(file_path, "rb") as f:
                response = self.client.files.create(
                    file=f,
                    purpose=purpose
                )

            self._put_in_queue("output", f"\n--- Upload Result ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            self._put_in_queue("status", f"File uploaded successfully (ID: {response.id}).")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except FileNotFoundError:
             self._put_in_queue("error", f"File not found: {file_path}")
             self._put_in_queue("status", "File Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    def _list_files(self):
        self._run_in_thread(self._list_files_thread)

    def _list_files_thread(self):
        try:
            self._put_in_queue("output", f"--- Listing Files ---")
            # Could add purpose filtering here
            response = self.client.files.list()

            self._put_in_queue("output", f"\n--- Files List ---")
            if response.data:
                 self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            else:
                 self._put_in_queue("output", "[No files found]")

            self._put_in_queue("status", "File list retrieved.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    def _retrieve_file(self):
        file_id = self.manage_file_id_var.get().strip()
        if not file_id:
            messagebox.showerror("Error", "Please enter a File ID to retrieve.")
            return
        self._run_in_thread(self._retrieve_file_thread, file_id)

    def _retrieve_file_thread(self, file_id):
        try:
            self._put_in_queue("output", f"--- Retrieving File Info (ID: {file_id}) ---")
            response = self.client.files.retrieve(file_id=file_id)

            self._put_in_queue("output", f"\n--- File Info ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            self._put_in_queue("status", "File info retrieved.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    # Retrieve content is often large, skipping direct display in GUI for simplicity
    # def _retrieve_file_content_thread(self, file_id): ...

    def _delete_file(self):
        file_id = self.manage_file_id_var.get().strip()
        if not file_id:
            messagebox.showerror("Error", "Please enter a File ID to delete.")
            return
        if messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete file '{file_id}'?"):
            self._run_in_thread(self._delete_file_thread, file_id)

    def _delete_file_thread(self, file_id):
        try:
            self._put_in_queue("output", f"--- Deleting File (ID: {file_id}) ---")
            response = self.client.files.delete(file_id=file_id)

            self._put_in_queue("output", f"\n--- Deletion Result ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            if response.deleted:
                 self._put_in_queue("status", f"File '{file_id}' deleted successfully.")
            else:
                 self._put_in_queue("status", f"File '{file_id}' deletion status unclear.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    def _create_moderation(self):
        self._run_in_thread(self._create_moderation_thread)

    def _create_moderation_thread(self):
        try:
            input_text = self.mod_input_text.get("1.0", tk.END).strip()
            model = self.mod_model_combo.get()

            if not input_text:
                self._put_in_queue("error", "Input text cannot be empty.")
                self._put_in_queue("enable_controls")
                return

            self._put_in_queue("output", f"--- Creating Moderation (Model: {model}) ---")

            response = self.client.moderations.create(
                input=input_text,
                model=model
            )

            self._put_in_queue("output", f"\n--- Moderation Result ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            self._put_in_queue("status", "Moderation check complete.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    def _list_models(self):
        self._run_in_thread(self._list_models_thread)

    def _list_models_thread(self):
        try:
            self._put_in_queue("output", f"--- Listing Models ---")
            response = self.client.models.list()
            self._put_in_queue("output", f"\n--- Available Models ---")
            if response.data:
                 # Just list IDs for brevity
                 model_list = sorted([m.id for m in response.data])
                 self._put_in_queue("output", "\n".join(model_list))
                 # Also repopulate comboboxes
                 self._put_in_queue("populate_models", model_list)
            else:
                 self._put_in_queue("output", "[No models found]")

            self._put_in_queue("status", "Model list retrieved.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    def _retrieve_model(self):
        model_id = self.retrieve_model_id_var.get().strip()
        if not model_id:
             messagebox.showerror("Error", "Please enter a Model ID to retrieve.")
             return
        self._run_in_thread(self._retrieve_model_thread, model_id)

    def _retrieve_model_thread(self, model_id):
        try:
            self._put_in_queue("output", f"--- Retrieving Model (ID: {model_id}) ---")
            response = self.client.models.retrieve(model=model_id)

            self._put_in_queue("output", f"\n--- Model Info ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            self._put_in_queue("status", "Model info retrieved.")

        except openai.APIError as e:
            self._put_in_queue("error", f"OpenAI API Error: {e}")
            self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
             self._put_in_queue("enable_controls")

    # --- Assistants API Methods ---

    def _list_assistants(self):
        self._run_in_thread(self._list_assistants_thread)

    def _list_assistants_thread(self):
        try:
            self._put_in_queue("output", "--- Listing Assistants ---")
            assistants = self.client.beta.assistants.list(order="desc", limit=20)
            self._put_in_queue("output", "\n--- Assistants List ---")
            assistant_data = []
            if assistants.data:
                for asst in assistants.data:
                    assistant_data.append((asst.name or f"Unnamed ({asst.id[:6]}...)", asst.id))
                    self._put_in_queue("output", f"- {asst.name or 'Unnamed'} (ID: {asst.id}, Model: {asst.model})")
                # Populate combobox
                self._put_in_queue("populate_assistants", assistant_data)
            else:
                self._put_in_queue("output", "[No assistants found]")
            self._put_in_queue("status", "Assistants listed.")
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")

    def _create_assistant(self):
        self._run_in_thread(self._create_assistant_thread)

    def _create_assistant_thread(self):
        try:
            name = self.asst_create_name_var.get().strip() or None
            model = self.asst_create_model_combo.get()
            instructions = self.asst_create_instructions_text.get("1.0", tk.END).strip() or None
            tools = []
            if self.asst_tool_code_var.get():
                tools.append({"type": "code_interpreter"})
            if self.asst_tool_search_var.get():
                 tools.append({"type": "file_search"}) # Changed from retrieval

            self._put_in_queue("output", "--- Creating Assistant ---")
            assistant = self.client.beta.assistants.create(
                name=name,
                instructions=instructions,
                tools=tools,
                model=model,
            )
            self._put_in_queue("output", "\n--- Assistant Created ---")
            self._put_in_queue("output", json.dumps(assistant.to_dict(), indent=2))
            self._put_in_queue("status", f"Assistant created (ID: {assistant.id}).")
            # Refresh list after creation
            self._list_assistants()

        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            # Don't re-enable here if _list_assistants was called
            # _list_assistants will handle enabling controls
            pass

    def _retrieve_assistant(self):
        assistant_id = self.asst_selected_id_var.get()
        if not assistant_id:
             messagebox.showerror("Error", "Please list and select an Assistant ID.")
             return
        self._run_in_thread(self._retrieve_assistant_thread, assistant_id)

    def _retrieve_assistant_thread(self, assistant_id):
        try:
            self._put_in_queue("output", f"--- Retrieving Assistant (ID: {assistant_id}) ---")
            assistant = self.client.beta.assistants.retrieve(assistant_id)
            self._put_in_queue("output", "\n--- Assistant Details ---")
            self._put_in_queue("output", json.dumps(assistant.to_dict(), indent=2))
            self._put_in_queue("status", "Assistant retrieved.")
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")


    def _delete_assistant(self):
        assistant_id = self.asst_selected_id_var.get()
        if not assistant_id:
             messagebox.showerror("Error", "Please list and select an Assistant ID.")
             return
        if messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete assistant '{assistant_id}'?"):
             self._run_in_thread(self._delete_assistant_thread, assistant_id)

    def _delete_assistant_thread(self, assistant_id):
         try:
            self._put_in_queue("output", f"--- Deleting Assistant (ID: {assistant_id}) ---")
            response = self.client.beta.assistants.delete(assistant_id)
            self._put_in_queue("output", "\n--- Deletion Result ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            if response.deleted:
                 self._put_in_queue("status", f"Assistant '{assistant_id}' deleted.")
                 # Clear selection and refresh list
                 self.asst_selected_id_var.set("")
                 self.asst_id_combo.set("")
                 self._list_assistants() # Will re-enable controls
            else:
                 self._put_in_queue("status", f"Assistant '{assistant_id}' deletion status unclear.")
                 self._put_in_queue("enable_controls")
         except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
             self._put_in_queue("enable_controls")
         except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
            self._put_in_queue("enable_controls")
         # No finally needed if _list_assistants is called

    def _create_thread(self):
         self._run_in_thread(self._create_thread_thread)

    def _create_thread_thread(self):
        try:
            self._put_in_queue("output", "--- Creating Thread ---")
            thread = self.client.beta.threads.create()
            self._put_in_queue("output", "\n--- Thread Created ---")
            self._put_in_queue("output", json.dumps(thread.to_dict(), indent=2))
            self._put_in_queue("status", f"Thread created (ID: {thread.id}).")
            # Add to combobox (assuming we want to manage threads similarly)
            current_threads = list(self.asst_thread_id_combo['values'])
            if thread.id not in current_threads:
                current_threads.insert(0, thread.id) # Add to beginning
                self._put_in_queue("populate_threads", current_threads)
            self.asst_selected_thread_id_var.set(thread.id) # Select the new one
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")

    def _retrieve_thread(self):
        thread_id = self.asst_selected_thread_id_var.get()
        if not thread_id:
             messagebox.showerror("Error", "Please create or select a Thread ID.")
             return
        self._run_in_thread(self._retrieve_thread_thread, thread_id)

    def _retrieve_thread_thread(self, thread_id):
        try:
            self._put_in_queue("output", f"--- Retrieving Thread (ID: {thread_id}) ---")
            thread = self.client.beta.threads.retrieve(thread_id)
            self._put_in_queue("output", "\n--- Thread Details ---")
            self._put_in_queue("output", json.dumps(thread.to_dict(), indent=2))
            self._put_in_queue("status", "Thread retrieved.")
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")

    def _delete_thread(self):
        thread_id = self.asst_selected_thread_id_var.get()
        if not thread_id:
             messagebox.showerror("Error", "Please create or select a Thread ID.")
             return
        if messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete thread '{thread_id}'?"):
             self._run_in_thread(self._delete_thread_thread, thread_id)

    def _delete_thread_thread(self, thread_id):
        try:
            self._put_in_queue("output", f"--- Deleting Thread (ID: {thread_id}) ---")
            response = self.client.beta.threads.delete(thread_id)
            self._put_in_queue("output", "\n--- Deletion Result ---")
            self._put_in_queue("output", json.dumps(response.to_dict(), indent=2))
            if response.deleted:
                 self._put_in_queue("status", f"Thread '{thread_id}' deleted.")
                 # Remove from combobox
                 current_threads = list(self.asst_thread_id_combo['values'])
                 if thread_id in current_threads:
                     current_threads.remove(thread_id)
                     self._put_in_queue("populate_threads", current_threads)
                 self.asst_selected_thread_id_var.set("")
                 self.asst_thread_id_combo.set("")
            else:
                 self._put_in_queue("status", f"Thread '{thread_id}' deletion status unclear.")
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")

    def _create_message(self):
        thread_id = self.asst_selected_thread_id_var.get()
        content = self.asst_thread_message_text.get("1.0", tk.END).strip()
        if not thread_id:
             messagebox.showerror("Error", "Please create or select a Thread ID.")
             return
        if not content:
             messagebox.showerror("Error", "Message content cannot be empty.")
             return
        self._run_in_thread(self._create_message_thread, thread_id, content)

    def _create_message_thread(self, thread_id, content):
        try:
            self._put_in_queue("output", f"--- Adding Message to Thread (ID: {thread_id}) ---")
            message = self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=content,
            )
            self._put_in_queue("output", "\n--- Message Added ---")
            self._put_in_queue("output", json.dumps(message.to_dict(), indent=2))
            self._put_in_queue("status", f"Message added (ID: {message.id}).")
            # Optionally clear the input box
            # self.asst_thread_message_text.delete('1.0', tk.END)
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")

    def _list_messages(self):
        thread_id = self.asst_selected_thread_id_var.get()
        if not thread_id:
             messagebox.showerror("Error", "Please create or select a Thread ID.")
             return
        self._run_in_thread(self._list_messages_thread, thread_id)

    def _list_messages_thread(self, thread_id):
        try:
            self._put_in_queue("output", f"--- Listing Messages for Thread (ID: {thread_id}) ---")
            messages = self.client.beta.threads.messages.list(thread_id=thread_id, order="asc") # List oldest first
            self._put_in_queue("output", "\n--- Messages ---")
            if messages.data:
                 for msg in messages.data:
                     text_content = "[Non-text content]"
                     if msg.content and isinstance(msg.content, list):
                         for content_part in msg.content:
                             if content_part.type == 'text' and content_part.text:
                                 text_content = content_part.text.value
                                 break # Show first text part only for brevity
                     self._put_in_queue("output", f"[{msg.role.upper()}] {text_content[:100]}{'...' if len(text_content)>100 else ''} (ID: {msg.id})")
                 self._put_in_queue("output", f"\n(Raw list object logged below)")
                 self._put_in_queue("output", json.dumps(messages.to_dict(), indent=2))
            else:
                 self._put_in_queue("output", "[No messages in thread]")
            self._put_in_queue("status", "Messages listed.")
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")

    def _create_run(self):
        thread_id = self.asst_run_thread_id_entry.get()
        assistant_id = self.asst_run_asst_id_entry.get()
        stream = self.asst_run_stream_var.get()
        if not thread_id:
             messagebox.showerror("Error", "Please select a Thread ID.")
             return
        if not assistant_id:
            messagebox.showerror("Error", "Please select an Assistant ID.")
            return
        self._run_in_thread(self._create_run_thread, thread_id, assistant_id, stream)

    def _create_run_thread(self, thread_id, assistant_id, stream):
        try:
            self._put_in_queue("output", f"--- Creating Run (Assistant: {assistant_id}, Thread: {thread_id}, Stream: {stream}) ---")

            if stream:
                # Use the event handler approach for streaming runs
                from openai import AssistantEventHandler

                class EventHandler(AssistantEventHandler):
                    def __init__(self, gui_queue):
                        super().__init__()
                        self.gui_queue = gui_queue
                        self.run_id = None
                        self.run_step_id = None

                    def _put_in_queue(self, message_type, data=None):
                        self.gui_queue.put((message_type, data))

                    def on_event(self, event):
                         # Retrieve events controller in this specific sync thread
                         # from openai import current_event
                         # Retrieve the run ID and step ID from the event data
                         try:
                             if hasattr(event.data, 'id'):
                                  if event.event.startswith("thread.run.step"):
                                     self.run_step_id = event.data.id
                                  elif event.event.startswith("thread.run"):
                                     self.run_id = event.data.id
                         except Exception:
                             pass # Ignore if ID not present

                         # Log the event type
                         self._put_in_queue("output", f"\n[STREAM EVENT: {event.event}]")
                         # Handle specific events for more detail
                         if event.event == 'thread.message.delta':
                              content_delta = event.data.delta.content[0]
                              if content_delta.type == 'text' and content_delta.text:
                                  self._put_in_queue("output", content_delta.text.value)
                         elif event.event == 'thread.run.step.created':
                             self._put_in_queue("output", f" Run Step Created: {event.data.id} Type: {event.data.type}")
                         elif event.event == 'thread.run.step.delta':
                             step_delta = event.data.delta.step_details
                             if step_delta:
                                  self._put_in_queue("output", f" Step Delta: {step_delta.type}")
                                  # Add more details for tool calls if needed
                                  # if step_delta.type == 'tool_calls' and step_delta.tool_calls: ...
                         elif event.event == 'thread.run.requires_action':
                             self._put_in_queue("output", f"\n--- Run Requires Action (Submit Tool Outputs) ---")
                             self._put_in_queue("output", f"Run ID: {event.data.id}")
                             self._put_in_queue("output", json.dumps(event.data.required_action.submit_tool_outputs.to_dict(), indent=2))
                             self._put_in_queue("status", "Run requires tool output submission.")
                             # Controls are re-enabled later by the stream handler wrapper

                    def on_end(self):
                          self._put_in_queue("output", f"\n--- Stream Ended ---")
                          # Optionally retrieve final run status here if needed
                          # Pass the run ID captured during the stream
                          if self.run_id:
                              try:
                                  final_run = self.client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=self.run_id)
                                  self._put_in_queue("output", f"\nFinal Run Status: {final_run.status}")
                                  self._put_in_queue("status", f"Run {final_run.status}.")
                                  # Log final usage if available
                                  if final_run.usage:
                                      self._put_in_queue("output", f"Usage: {json.dumps(final_run.usage.to_dict(), indent=2)}")

                              except Exception as e:
                                  self._put_in_queue("output", f"[Could not fetch final run status: {e}]")
                                  self._put_in_queue("status", "Stream ended, final status unknown.")
                          else:
                               self._put_in_queue("status", "Run stream ended.")
                          # Re-enable controls after stream finishes
                          self._put_in_queue("enable_controls")

                event_handler = EventHandler(self.message_queue)

                # The actual streaming call using the context manager
                with self.client.beta.threads.runs.stream(
                    thread_id=thread_id,
                    assistant_id=assistant_id,
                     event_handler=event_handler,
                     # Pass other run parameters if needed (instructions, model, etc.)
                 ) as stream_manager:
                      # stream_manager.until_done() # This blocks, but the handler runs async
                      # Instead of blocking, we let the main loop handle GUI updates via the queue
                      # The 'on_end' method of the handler will signal completion.
                      self._put_in_queue("status", "Run stream started...")
                      # The _run_in_thread wrapper will exit, but the SDK's internal threads keep running
                      pass # Let the context manager handle the stream lifecycle


            else: # Non-streaming run
                run = self.client.beta.threads.runs.create(
                    thread_id=thread_id,
                    assistant_id=assistant_id,
                    # Pass other run parameters if needed
                )
                self.asst_selected_run_id_var.set(run.id) # Store the run ID
                self._put_in_queue("output", "\n--- Run Created (Non-Streamed) ---")
                self._put_in_queue("output", json.dumps(run.to_dict(), indent=2))
                self._put_in_queue("status", f"Run created (ID: {run.id}). Poll for status.")
                # Re-enable controls immediately for non-streaming
                self._put_in_queue("enable_controls")


        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
             self._put_in_queue("enable_controls") # Enable on error
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
            self._put_in_queue("enable_controls") # Enable on error
        # No finally if streaming, as controls are handled by the event handler's on_end


    def _retrieve_run(self):
        thread_id = self.asst_run_thread_id_entry.get()
        run_id = self.asst_selected_run_id_var.get()
        if not thread_id:
             messagebox.showerror("Error", "Please select a Thread ID.")
             return
        if not run_id:
             messagebox.showerror("Error", "Please enter or create a Run ID.")
             return
        self._run_in_thread(self._retrieve_run_thread, thread_id, run_id)

    def _retrieve_run_thread(self, thread_id, run_id):
        try:
            self._put_in_queue("output", f"--- Retrieving Run (ID: {run_id}) ---")
            run = self.client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
            self._put_in_queue("output", "\n--- Run Details ---")
            self._put_in_queue("output", json.dumps(run.to_dict(), indent=2))
            self._put_in_queue("status", f"Run retrieved (Status: {run.status}).")
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")

    def _list_run_steps(self):
        thread_id = self.asst_run_thread_id_entry.get()
        run_id = self.asst_selected_run_id_var.get()
        if not thread_id:
             messagebox.showerror("Error", "Please select a Thread ID.")
             return
        if not run_id:
             messagebox.showerror("Error", "Please enter or create a Run ID.")
             return
        self._run_in_thread(self._list_run_steps_thread, thread_id, run_id)

    def _list_run_steps_thread(self, thread_id, run_id):
        try:
            self._put_in_queue("output", f"--- Listing Run Steps (Run ID: {run_id}) ---")
            run_steps = self.client.beta.threads.runs.steps.list(thread_id=thread_id, run_id=run_id)
            self._put_in_queue("output", "\n--- Run Steps ---")
            if run_steps.data:
                 self._put_in_queue("output", json.dumps(run_steps.to_dict(), indent=2))
            else:
                 self._put_in_queue("output", "[No steps found for this run]")
            self._put_in_queue("status", "Run steps listed.")
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")

    def _cancel_run(self):
        thread_id = self.asst_run_thread_id_entry.get()
        run_id = self.asst_selected_run_id_var.get()
        if not thread_id:
             messagebox.showerror("Error", "Please select a Thread ID.")
             return
        if not run_id:
             messagebox.showerror("Error", "Please enter or create a Run ID.")
             return
        if messagebox.askyesno("Confirm Cancel", f"Are you sure you want to cancel run '{run_id}'?"):
             self._run_in_thread(self._cancel_run_thread, thread_id, run_id)

    def _cancel_run_thread(self, thread_id, run_id):
        try:
            self._put_in_queue("output", f"--- Cancelling Run (ID: {run_id}) ---")
            run = self.client.beta.threads.runs.cancel(thread_id=thread_id, run_id=run_id)
            self._put_in_queue("output", "\n--- Cancellation Result ---")
            self._put_in_queue("output", json.dumps(run.to_dict(), indent=2))
            self._put_in_queue("status", f"Run cancellation requested (Status: {run.status}).")
        except openai.APIError as e:
             self._put_in_queue("error", f"OpenAI API Error: {e}")
             self._put_in_queue("status", "API Error.")
        except Exception as e:
            self._put_in_queue("error", f"An unexpected error occurred: {e}")
            self._put_in_queue("status", "Error.")
        finally:
            self._put_in_queue("enable_controls")


# --- Run the Application ---
if __name__ == "__main__":
    app = OpenAIDemoApp()
    app.mainloop()