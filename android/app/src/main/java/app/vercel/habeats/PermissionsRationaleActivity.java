package app.vercel.habeats;

import android.os.Bundle;
import android.view.Gravity;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class PermissionsRationaleActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        TextView content = new TextView(this);
        int padding = (int) (24 * getResources().getDisplayMetrics().density);
        content.setPadding(padding, padding, padding, padding);
        content.setGravity(Gravity.START);
        content.setTextSize(16);
        content.setText(
            "Habeats uses Health Connect to read your heart rate, resting heart rate, HRV, sleep, and steps. " +
            "This data is used only to personalize your wellness insights inside the app."
        );

        setTitle("Health data access");
        setContentView(content);
    }
}
