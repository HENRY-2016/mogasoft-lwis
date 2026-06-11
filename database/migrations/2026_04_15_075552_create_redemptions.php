<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('welfare_allocation_id')->constrained('allocations')->onDelete('cascade');
            $table->foreignId('redeemed_by')->constrained('employees');
            $table->decimal('amount_redeemed', 10, 2);
            $table->datetime('redemption_time');
            $table->string('redemption_location')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('redemptions');
    }
};