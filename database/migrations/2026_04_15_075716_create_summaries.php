<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('welfare_summaries', function (Blueprint $table) {
            $table->id();
            $table->date('summary_date');
            $table->integer('total_allocations');
            $table->decimal('total_amount_allocated', 12, 2);
            $table->integer('total_redeemed');
            $table->decimal('total_amount_redeemed', 12, 2);
            $table->integer('total_pending');
            $table->decimal('total_amount_pending', 12, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('welfare_summaries');
    }
};