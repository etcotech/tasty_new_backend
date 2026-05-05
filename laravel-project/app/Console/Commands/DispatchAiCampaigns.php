<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AiCampaign;
use App\Services\AiCampaignDispatcher;
use Carbon\Carbon;

class DispatchAiCampaigns extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai-campaigns:dispatch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch scheduled AI campaigns whose time has arrived';

    /**
     * Execute the console command.
     */
    public function handle(AiCampaignDispatcher $dispatcher)
    {
        $this->info('Starting AI Campaign Dispatcher...');

        $campaigns = AiCampaign::where('status', 'scheduled')
            ->where('scheduled_at', '<=', Carbon::now())
            ->get();

        if ($campaigns->isEmpty()) {
            $this->info('No campaigns to dispatch.');
            return;
        }

        foreach ($campaigns as $campaign) {
            $this->info("Dispatching Campaign #{$campaign->id}: {$campaign->title}...");
            
            $result = $dispatcher->dispatch($campaign);

            if ($result['success']) {
                $this->info("SUCCESS: {$result['message']}");
            } else {
                $this->error("FAILED: {$result['message']}");
            }
        }

        $this->info('Finished dispatching campaigns.');
    }
}
